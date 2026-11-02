/* Animate the original painting. No replacement artwork or dependencies.
   A height-weighted displacement leaves the bottom 16% (roots/soil) fixed. */
(() => {
  'use strict';

  const garden = document.querySelector('.garden');
  if (!garden) return;
  const canvas = garden.querySelector('canvas');
  const toggle = garden.querySelector('.garden-motion');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const art = new Image();
  art.src = '/assets/cobalt-garden/garden-v2.webp';

  let gl, program, resolution, clock, impulsesLocation, tileRatio;
  let ready = false, loading = false, failed = false, paused = false;
  let inView = !('IntersectionObserver' in window);
  let frame = 0, lastFrame = 0, elapsed = 0, width = 0, height = 0;
  let previousPointer = null, lastImpulse = -1, impulseIndex = 0;
  const impulses = new Float32Array(6 * 4);
  for (let i = 0; i < 6; i++) impulses[i * 4 + 2] = -100;
  try { paused = localStorage.getItem('garden-motion-paused') === 'true'; } catch {}

  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = vec2((aPosition.x + 1.0) * 0.5, (1.0 - aPosition.y) * 0.5);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`;

  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec2 vUv;
    uniform sampler2D uArtwork;
    uniform vec2 uResolution;
    uniform float uTileRatio;
    uniform float uTime;
    uniform vec4 uImpulses[6];
    void main() {
      float x = vUv.x * uResolution.x;
      float stem = max(0.0, (0.84 - vUv.y) / 0.84);
      float bend = pow(stem, 1.7);
      // Slowly travelling gusts, with a quieter, faster flutter underneath.
      float wind = 7.0 * sin(uTime * 0.85 - x * 0.006)
                 + 2.4 * sin(uTime * 1.55 - x * 0.017)
                 + 1.0 * sin(uTime * 2.1 + x * 0.031);
      float touch = 0.0;
      for (int i = 0; i < 6; i++) {
        vec4 impulse = uImpulses[i];
        float age = max(0.0, uTime - impulse.z);
        float distance = (x - impulse.x) / 48.0;
        // A local, damped spring: a nudge, a small rebound, then rest.
        touch += impulse.y * impulse.w * exp(-distance * distance * 0.5)
               * sin(age * 10.5) * exp(-age * 2.7);
      }
      touch = clamp(touch, -28.0, 28.0);
      float sourceX = x - bend * (wind + touch);
      float sourceY = vUv.y - bend * 0.004 * sin(uTime * 1.15 - x * 0.009);
      float tileWidth = uResolution.y * uTileRatio;
      float origin = (uResolution.x - tileWidth) * 0.5;
      // Manual horizontal wrapping also works with non-power-of-two artwork.
      vec2 uv = vec2(fract((sourceX - origin) / tileWidth), clamp(sourceY, 0.0, 1.0));
      gl_FragColor = texture2D(uArtwork, uv);
    }`;

  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      gl.deleteShader(result);
      throw new Error('Garden shader unavailable');
    }
    return result;
  }

  function canAnimate() {
    return ready && !reducedMotion.matches && !paused && inView && !document.hidden;
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    previousPointer = null;
  }

  function draw() {
    gl.uniform1f(clock, elapsed);
    gl.uniform4fv(impulsesLocation, impulses);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function animate(now) {
    frame = 0;
    if (!canAnimate()) return;
    // 30 fps is enough for a slow breeze; skip GPU work between those frames.
    if (!lastFrame || now - lastFrame >= 1000 / 30) {
      elapsed += lastFrame ? Math.min((now - lastFrame) / 1000, 0.08) : 0;
      lastFrame = now;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }

  function sync() {
    if (!ready) return;
    const reduced = reducedMotion.matches;
    canvas.hidden = reduced;
    toggle.hidden = reduced;
    garden.toggleAttribute('data-rendered', !reduced);
    toggle.dataset.paused = String(paused);
    const label = paused ? 'Resume flower animation' : 'Pause flower animation';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    if (canAnimate()) {
      garden.dataset.motion = 'running';
      if (!frame) frame = requestAnimationFrame(animate);
    } else {
      garden.dataset.motion = reduced ? 'reduced' : paused ? 'paused' : 'idle';
      stop();
    }
  }

  function resize() {
    if (!ready) return;
    width = garden.clientWidth;
    height = garden.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, width, height);
    // Downsample once at display resolution so fine painted stems do not shimmer.
    const textureCanvas = document.createElement('canvas');
    textureCanvas.height = canvas.height;
    textureCanvas.width = Math.round(canvas.height * art.naturalWidth / art.naturalHeight);
    const textureContext = textureCanvas.getContext('2d');
    textureContext.imageSmoothingQuality = 'high';
    textureContext.drawImage(art, 0, 0, textureCanvas.width, textureCanvas.height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
    // Old pointer coordinates should not travel across a resized garden.
    impulses.fill(0);
    previousPointer = null;
    draw();
  }

  function fallback() {
    ready = false;
    stop();
    canvas.hidden = true;
    toggle.hidden = true;
    garden.removeAttribute('data-rendered');
    garden.dataset.motion = 'static';
  }

  async function setup() {
    if (ready || loading || failed || reducedMotion.matches) return;
    loading = true;
    try {
      await art.decode();
      gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false,
        stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' });
      if (!gl) throw new Error('WebGL unavailable');
      const vertex = shader(gl.VERTEX_SHADER, vertexSource);
      const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Garden program unavailable');
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(gl.getUniformLocation(program, 'uArtwork'), 0);
      resolution = gl.getUniformLocation(program, 'uResolution');
      clock = gl.getUniformLocation(program, 'uTime');
      impulsesLocation = gl.getUniformLocation(program, 'uImpulses[0]');
      tileRatio = gl.getUniformLocation(program, 'uTileRatio');
      gl.uniform1f(tileRatio, art.naturalWidth / art.naturalHeight);
      ready = true;
      resize();
      sync();
    } catch {
      failed = true;
      fallback();
    } finally {
      loading = false;
    }
  }

  garden.addEventListener('pointermove', event => {
    if (!canAnimate() || event.pointerType === 'touch' || event.target.closest('button')) return;
    const bounds = garden.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const previous = previousPointer;
    previousPointer = { x, y, time: event.timeStamp };
    if (!previous || elapsed - lastImpulse < 0.075 || y > height * 0.84) return;
    const dx = x - previous.x;
    const distance = Math.hypot(dx, y - previous.y);
    if (distance < 1) return;
    const speed = distance / Math.max(8, event.timeStamp - previous.time) * 1000;
    const direction = dx < 0 ? -1 : 1;
    const force = direction * Math.min(38, 14 + speed * 0.025);
    impulses.set([x, force, elapsed, Math.max(0, 1 - y / (height * 0.84))], impulseIndex * 4);
    impulseIndex = (impulseIndex + 1) % 6;
    lastImpulse = elapsed;
  }, { passive: true });
  garden.addEventListener('pointerleave', () => { previousPointer = null; });
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('garden-motion-paused', String(paused)); } catch {}
    sync();
  });
  reducedMotion.addEventListener('change', () => { sync(); setup(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', sync);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    fallback();
  });
  canvas.addEventListener('webglcontextrestored', () => { failed = false; setup(); });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(garden);
  else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sync();
    }).observe(garden);
  }
  setup();
})();
