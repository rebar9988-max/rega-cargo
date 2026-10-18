import { useEffect, useRef } from "react";

/*
 * Animated red silk behind the homepage hero artwork.
 *
 * The artwork is split into two images: the original flattened art (`hero-art.webp`, the poster,
 * shown first and kept for reduced motion, no WebGL or a lost context) and the same pixels with the
 * silk cut away (`hero-fg.webp`: headphones and podium only). Once a silk frame has been drawn, the
 * canvas fades in between the two, so only the silk moves; the foreground never changes.
 *
 * One renderer for every width: the silk is computed in the artwork's own pixel space (504 × 496,
 * mapped exactly like `object-fit: cover`), so phones and desktops show the same folds, light and
 * motion relative to the headphones; only the canvas size changes.
 */

const ART_W = 504;
const ART_H = 496;
// Backing-store density. Silk is soft gradients, so 1.5 device pixels per CSS pixel is visually
// lossless and keeps the fill cost bounded on 3x phones.
const MAX_DPR = 1.5;
// If a device cannot hold the frame rate, the silk is rendered at a lower internal resolution
// (never below half a device pixel per CSS pixel); if even that stays under ~23 fps the still
// artwork is kept. The same rule applies to every device and width.
const SLOW_FRAME_MS = 22;
const MIN_QUALITY = 0.5;

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Height field = slow diagonal drapes, domain-warped so folds bend and drift like fabric in a soft
// breeze. Incommensurate speeds keep the motion from visibly looping. Lighting is satin-like: a soft
// diffuse body, a broad sheen and a narrow highlight, in the artwork's deep reds.
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;      // canvas size in device pixels
uniform float u_scale;   // device pixels per artwork pixel
uniform vec2 u_offset;   // artwork origin inside the canvas, device pixels (top-left based)
uniform float u_time;

float field(vec2 p, float t) {
  // Bend the plane slowly: the long folds curve and drift like cloth lifted by a breeze.
  vec2 q = p;
  q.x += 0.55 * sin(q.y * 0.55 + t * 0.090);
  q.y += 0.40 * sin(q.x * 0.47 - t * 0.071 + 1.0);
  q += 0.18 * vec2(sin(q.y * 1.35 - t * 0.130 + 2.0), sin(q.x * 1.20 + t * 0.107));
  // Folds run mostly along one diagonal (as in the reference); a weaker cross ripple breaks them up.
  float u = dot(q, vec2(0.82, -0.57));
  float v = dot(q, vec2(0.57, 0.82));
  float a = sin(u * 1.55 + 0.35 * sin(v * 0.9 + t * 0.060) + t * 0.170);
  float b = sin(u * 3.05 + v * 0.45 - t * 0.123 + 2.0);
  float c = sin(v * 1.10 + u * 0.30 + t * 0.091 + 4.0);
  float gust = 0.85 + 0.15 * sin(t * 0.053 + v * 0.35);
  float h = a * 0.66 + b * 0.25 + c * 0.15;
  // Rounded crests, tighter creases: draped satin rather than a water surface.
  return gust * (h + 0.30 * h * abs(h));
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 frag = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 art = (frag - u_offset) / u_scale;     // artwork pixels
  vec2 p = art / 92.0;
  float t = u_time * 0.7;

  float e = 0.01;
  float h = field(p, t);
  float hx = field(p + vec2(e, 0.0), t);
  float hy = field(p + vec2(0.0, e), t);
  vec3 n = normalize(vec3(-(hx - h) / e * 0.62, (hy - h) / e * 0.62, 1.0));

  vec3 l = normalize(vec3(0.50, 0.58, 0.64));  // key light from the upper right, like the art
  vec3 hv = normalize(l + vec3(0.0, 0.0, 1.0));
  float k = clamp(dot(n, l), 0.0, 1.0);
  float nh = clamp(dot(n, hv), 0.0, 1.0);
  float cavity = 0.62 + 0.38 * smoothstep(-1.2, 0.9, h);
  k = 0.17 + 0.83 * k * cavity;

  // Satin ramp sampled from the reference silk: near-black red creases, saturated body,
  // warm orange-red sheen on the crests.
  vec3 col = vec3(0.21, 0.0, 0.01);
  col = mix(col, vec3(0.50, 0.006, 0.022), smoothstep(0.10, 0.48, k));
  col = mix(col, vec3(0.80, 0.020, 0.035), smoothstep(0.40, 0.78, k));
  col = mix(col, vec3(0.98, 0.13, 0.09), smoothstep(0.80, 0.98, k));
  col += pow(nh, 46.0) * vec3(1.0, 0.42, 0.34) * 0.38;
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;   // static dither against banding
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroSilk() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const fg = fgRef.current;
    if (!stage || !canvas || !fg) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let disposed = false;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uScale: WebGLUniformLocation | null = null;
    let uOffset: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let frame = 0;
    let visible = true;
    let elapsed = 0; // seconds of animation actually shown; pauses keep the folds where they were
    let last = 0;
    let idle = 0;
    let quality = 1;
    let tooSlow = false;
    let sampled = 0; // frames measured at the current quality
    let slowTime = 0;
    let cssW = 0;
    let cssH = 0;
    let resize: ResizeObserver | null = null;
    let inView: IntersectionObserver | null = null;

    const running = () =>
      !disposed && !tooSlow && gl && visible && !document.hidden && !motion.matches;

    const draw = (now: number) => {
      frame = 0;
      if (!running() || !gl) return;
      if (last) {
        const delta = now - last;
        elapsed += Math.min(delta, 100) / 1000;
        // Skip the first frames (shader warm-up), then judge the average of the next 40.
        if (++sampled > 10) {
          slowTime += delta;
          if (sampled === 50) {
            const average = slowTime / 40;
            sampled = 0;
            slowTime = 0;
            if (average > SLOW_FRAME_MS && quality > MIN_QUALITY) {
              quality = Math.max(MIN_QUALITY, quality * 0.7);
              size(cssW, cssH);
            } else if (average > 2 * SLOW_FRAME_MS) {
              // Still under ~23 fps at the lowest resolution: keep the still artwork instead.
              tooSlow = true;
              return hide();
            }
          }
        }
      }
      last = now;
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (stage.dataset.silk !== "on") stage.dataset.silk = "on";
      frame = requestAnimationFrame(draw);
    };
    const start = () => {
      if (!frame && running()) {
        last = 0;
        sampled = 0;
        slowTime = 0;
        frame = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const size = (width: number, height: number) => {
      cssW = width;
      cssH = height;
      if (!gl || width <= 0 || height <= 0) return;
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_DPR) * quality;
      const w = Math.max(1, Math.round(width * ratio));
      const h = Math.max(1, Math.round(height * ratio));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      // Same mapping as `object-fit: cover` for the images (no horizontal offset at any width: the
      // stage has the art's aspect on phones and is left-aligned on desktop; vertically centred),
      // so the silk stays registered to the headphones at every width.
      const scale = Math.max(w / ART_W, h / ART_H);
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uScale, scale);
      gl.uniform2f(uOffset, 0, (h - ART_H * scale) / 2);
      if (!frame && gl && !motion.matches) {
        // Keep a correct still frame while paused (for example after a resize off-screen).
        gl.uniform1f(uTime, elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };

    const hide = () => {
      stop();
      delete stage.dataset.silk;
    };

    const init = () => {
      if (disposed || motion.matches) return;
      gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      });
      if (!gl) return;
      const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
      program = gl.createProgram();
      if (!vs || !fs || !program) return hide();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return hide();
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // One oversized triangle covers the viewport.
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uRes = gl.getUniformLocation(program, "u_res");
      uScale = gl.getUniformLocation(program, "u_scale");
      uOffset = gl.getUniformLocation(program, "u_offset");
      uTime = gl.getUniformLocation(program, "u_time");
      // Start a little into the motion so the first frame already shows developed folds.
      elapsed = 37;

      resize = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect;
        if (box) size(box.width, box.height);
      });
      resize.observe(canvas);
      inView = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) start();
        else stop();
      });
      inView.observe(stage);
      start();
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotion = () => {
      if (motion.matches) hide();
      else if (gl) start();
      else init();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      gl = null;
      hide();
    };

    // The foreground must be decoded before the silk can replace the poster's background.
    // Load it, and start WebGL, only after the page is idle, so first paint and LCP stay the poster.
    const boot = () => {
      if (disposed || motion.matches) return;
      fg.src = "/home/hero-fg.webp";
      fg.decode()
        .then(init)
        .catch(() => undefined);
    };
    const schedule = () => {
      const ric = window.requestIdleCallback;
      idle = ric ? ric(boot, { timeout: 2000 }) : window.setTimeout(boot, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      stop();
      window.removeEventListener("load", schedule);
      if (idle) (window.cancelIdleCallback ?? window.clearTimeout)(idle);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      canvas.removeEventListener("webglcontextlost", onLost);
      resize?.disconnect();
      inView?.disconnect();
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
      delete stage.dataset.silk;
    };
  }, []);

  return (
    <div ref={stageRef} className="rl-ref-hero-stage">
      <img
        className="rl-ref-hero-poster"
        src="/home/hero-art.webp"
        alt=""
        width={ART_W}
        height={ART_H}
        fetchPriority="high"
        decoding="async"
      />
      <canvas ref={canvasRef} className="rl-ref-hero-silk" />
      <img ref={fgRef} className="rl-ref-hero-fg" alt="" width={ART_W} height={ART_H} />
    </div>
  );
}
