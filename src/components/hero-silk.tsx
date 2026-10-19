import { useEffect, useRef } from "react";

const ART_W = 504;
const ART_H = 496;
const FRAME_MS = 1000 / 30;
// Preserve crisp compositing on high-density phones; adapt only the decorative buffer
// on slower devices. The product always comes from the untouched poster underneath.
const MAX_PIXELS = 800_000;
const MIN_PIXELS = 200_000;
const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Sample the original photograph: never replace its folds, colour or lighting. The foreground
// clearance matte anchors the foreground and softly releases the fabric around its edges.
const FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_artSize;
uniform vec2 u_offset;
uniform float u_scale;
uniform float u_time;
uniform sampler2D u_art;
uniform sampler2D u_mask;
void main() {
  vec2 pixel = (vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) - u_offset) / u_scale;
  vec2 uv = pixel / u_artSize;
  // Twelve stationary source pixels exceed the maximum displacement. Feather out to
  // 32 pixels so the larger, visible waves never reveal a hard cut around the product.
  float silk = smoothstep(12.0 / 32.0, 1.0, texture2D(u_mask, uv).a);
  // Anchor the frame edges and the stage; no breathing/translation of the entire background.
  vec2 edge = smoothstep(vec2(0.0), vec2(0.035), uv)
    * (1.0 - smoothstep(vec2(0.965), vec2(1.0), uv));
  silk *= edge.x * edge.y * (1.0 - smoothstep(0.79, 0.85, uv.y));
  float mainPhase = u_time * 6.28318530718 / 18.0;
  float secondaryPhase = u_time * 6.28318530718 / 26.0;
  float mainWave = sin(uv.y * 7.0 + uv.x * 2.0 + mainPhase);
  float secondaryWave = sin(uv.x * 6.0 - uv.y * 3.0 - secondaryPhase);
  // A few source pixels of local fold travel remain visible at phone sizes. The old
  // sub-pixel movement drew frames, but read as a still photograph at normal speed.
  vec2 displacement = vec2(mainWave * 6.0 + secondaryWave * 2.0,
    mainWave * 4.0 - secondaryWave * 2.5) * silk / u_artSize;
  vec4 cloth = texture2D(u_art, uv + displacement);
  // Use the photograph's own moving highlights, without recolouring it. Explicit
  // premultiplication also guarantees transparent product pixels contain zero RGB;
  // masked mobile compositors must never receive hidden, bright foreground colours.
  gl_FragColor = vec4(cloth.rgb * silk, silk);
}
`;

// Build once at the small source resolution. A distance field gives smooth protection
// around every edge without repeated per-frame mask samples or browser-specific filters.
function clearanceMask(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = ART_W;
  canvas.height = ART_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Silk protection canvas unavailable");
  ctx.drawImage(image, 0, 0, ART_W, ART_H);
  const pixels = ctx.getImageData(0, 0, ART_W, ART_H);
  const distance = new Float32Array(ART_W * ART_H);
  for (let i = 0; i < distance.length; i++) distance[i] = pixels.data[i * 4 + 3] ? 0 : 1000;
  for (const direction of [1, -1]) {
    for (let row = 0; row < ART_H; row++) {
      const y = direction === 1 ? row : ART_H - 1 - row;
      for (let col = 0; col < ART_W; col++) {
        const x = direction === 1 ? col : ART_W - 1 - col;
        const i = y * ART_W + x;
        const previousX = x - direction;
        const previousY = y - direction;
        if (previousX >= 0 && previousX < ART_W) {
          distance[i] = Math.min(distance[i], distance[i - direction] + 1);
        }
        if (previousY < 0 || previousY >= ART_H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          if (x + dx < 0 || x + dx >= ART_W) continue;
          distance[i] = Math.min(
            distance[i],
            distance[previousY * ART_W + x + dx] + (dx ? Math.SQRT2 : 1),
          );
        }
      }
    }
  }
  for (let i = 0; i < distance.length; i++) {
    pixels.data[i * 4 + 3] = Math.round(255 * Math.min(1, distance[i] / 32));
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

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

/** Decorative only. A future genuine GLB viewer belongs in a separate, stationary product layer. */
export function HeroSilk() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const poster = posterRef.current;
    if (!stage || !canvas || !poster) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mask = new Image();
    let disposed = false;
    let failed = false;
    let preparing = false;
    let visible = false;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    const textures: WebGLTexture[] = [];
    let uTime: WebGLUniformLocation | null = null;
    let frame = 0;
    let idle: number | null = null;
    let elapsed = 0;
    let last = 0;
    let painted = 0;
    let slowFrames = 0;
    let pixelBudget = MAX_PIXELS;
    let resize: ResizeObserver | null = null;

    const allowed = () => !disposed && !failed && visible && !document.hidden && !motion.matches;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      painted = 0;
    };
    const release = () => {
      if (gl) {
        textures.forEach((texture) => gl!.deleteTexture(texture));
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
      textures.length = 0;
      gl = null;
    };
    const fallback = () => {
      failed = true;
      stop();
      delete stage.dataset.silk;
      release();
    };
    const draw = (now: number) => {
      frame = 0;
      if (!allowed() || !gl) {
        if (motion.matches) delete stage.dataset.silk;
        return;
      }
      if (!painted || now - painted >= FRAME_MS - 1) {
        const delta = last ? now - last : 0;
        elapsed += Math.min(delta, 100) / 1000;
        // Lower decorative resolution under sustained load instead of permanently
        // freezing the silk after a short spell of slow mobile frames.
        slowFrames = delta > 70 ? slowFrames + 1 : 0;
        if (slowFrames >= 20 && pixelBudget > MIN_PIXELS) {
          pixelBudget = Math.max(MIN_PIXELS, pixelBudget / 2);
          slowFrames = 0;
          size();
        }
        last = now;
        painted = now;
        gl.uniform1f(uTime, elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        stage.dataset.silk = "on";
      }
      frame = requestAnimationFrame(draw);
    };
    const start = () => {
      if (!frame && allowed() && gl) frame = requestAnimationFrame(draw);
    };
    const size = () => {
      if (!gl || !program) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const density = Math.min(
        window.devicePixelRatio || 1,
        3,
        Math.sqrt(pixelBudget / (width * height)),
      );
      canvas.width = Math.max(1, Math.round(width * density));
      canvas.height = Math.max(1, Math.round(height * density));
      const w = canvas.width;
      const h = canvas.height;
      const scale = Math.max(w / ART_W, h / ART_H);
      // CSS object-position is right on mobile, left on desktop; vertically centred on both.
      const offsetX = window.matchMedia("(min-width: 48rem)").matches ? 0 : w - ART_W * scale;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(gl.getUniformLocation(program, "u_res"), w, h);
      gl.uniform2f(gl.getUniformLocation(program, "u_artSize"), ART_W, ART_H);
      gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale);
      gl.uniform2f(gl.getUniformLocation(program, "u_offset"), offsetX, (h - ART_H * scale) / 2);
      if (allowed()) {
        gl.uniform1f(uTime, elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
    const init = () => {
      gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      });
      if (!gl) return fallback();
      const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
      program = gl.createProgram();
      if (!vs || !fs || !program) {
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return fallback();
      }
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fallback();
      gl.useProgram(program);
      buffer = gl.createBuffer();
      if (!buffer) return fallback();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const [unit, image] of [poster, clearanceMask(mask)].entries()) {
        const texture = gl.createTexture();
        if (!texture) return fallback();
        textures.push(texture);
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(gl.getUniformLocation(program, unit ? "u_mask" : "u_art"), unit);
      }
      uTime = gl.getUniformLocation(program, "u_time");
      size();
      resize = new ResizeObserver(size);
      resize.observe(stage);
      start();
    };
    const boot = async () => {
      if (!allowed() || preparing || gl) return;
      preparing = true;
      try {
        mask.src = "/home/hero-fg.webp";
        await Promise.all([poster.decode(), mask.decode()]);
        // Media/visibility can change during decoding. Always wait for the decoded mask.
        if (allowed()) init();
      } catch {
        if (!disposed) fallback();
      } finally {
        preparing = false;
      }
    };
    const resume = () => {
      if (!allowed()) return stop();
      if (gl) return start();
      if (preparing || idle !== null) return;
      const run = () => {
        idle = null;
        void boot();
      };
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(run, { timeout: 2000 })
        : window.setTimeout(run, 300);
    };
    const onMotion = () => {
      if (motion.matches) {
        stop();
        delete stage.dataset.silk;
      } else resume();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      fallback();
    };
    const inView = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      resume();
    });
    inView.observe(stage);
    document.addEventListener("visibilitychange", resume);
    motion.addEventListener("change", onMotion);
    canvas.addEventListener("webglcontextlost", onLost);
    return () => {
      disposed = true;
      stop();
      if (idle !== null) (window.cancelIdleCallback ?? window.clearTimeout)(idle);
      document.removeEventListener("visibilitychange", resume);
      motion.removeEventListener("change", onMotion);
      canvas.removeEventListener("webglcontextlost", onLost);
      resize?.disconnect();
      inView.disconnect();
      release();
      delete stage.dataset.silk;
    };
  }, []);

  return (
    <div ref={stageRef} className="rl-ref-hero-stage" aria-hidden="true">
      <img
        ref={posterRef}
        className="rl-ref-hero-poster"
        src="/home/hero-art.webp"
        alt=""
        width={ART_W}
        height={ART_H}
        fetchPriority="high"
        decoding="async"
      />
      <canvas ref={canvasRef} className="rl-ref-hero-silk" />
    </div>
  );
}
