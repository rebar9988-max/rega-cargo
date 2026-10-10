/** Static, non-personal appearance preference. Keep the exact CSP hash in sync (tested). */
export const APPEARANCE_SCRIPT =
  '(function(){var t;try{t=localStorage.getItem("rl-theme-v1");if(localStorage.getItem("rl-announcement-v1")==="closed")document.documentElement.dataset.announcement="closed"}catch(e){}document.documentElement.dataset.theme=t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"})()';
export const APPEARANCE_CSP = "'sha256-tTP5OWKRFDAdjvBhbULc0Ftty/IGAVLvjtIAp0zCZzQ='";
