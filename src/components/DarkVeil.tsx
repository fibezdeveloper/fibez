'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

/**
 * A slow, dark, flowing veil drawn with a WebGL fragment shader (ogl). Deep navy with a touch of violet.
 * Same props as the React Bits "DarkVeil" so it can be swapped. This is our own shader, not a copy of theirs.
 */
export interface DarkVeilProps {
  /** Rotates the colours around the wheel, in degrees. */
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  /** How hard the flow folds over itself. */
  warpAmount?: number;
  /** Render scale (0.3 - 1). Lower is cheaper; the veil is soft so 0.5 looks the same. */
  resolutionScale?: number;
  /** Frame cap. */
  maxFps?: number;
  className?: string;
}

const vertex = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(3.1, 1.7);
    a *= 0.5;
  }
  return v;
}

vec3 hueShift(vec3 c, float deg) {
  float a = radians(deg);
  float s = sin(a);
  float co = cos(a);
  mat3 m = mat3(
    0.299 + 0.701 * co + 0.168 * s, 0.587 - 0.587 * co + 0.330 * s, 0.114 - 0.114 * co - 0.497 * s,
    0.299 - 0.299 * co - 0.328 * s, 0.587 + 0.413 * co + 0.035 * s, 0.114 - 0.114 * co + 0.292 * s,
    0.299 - 0.300 * co + 1.250 * s, 0.587 - 0.588 * co - 1.050 * s, 0.114 + 0.886 * co - 0.203 * s
  );
  return clamp(m * c, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
  float t = uTime * 0.1;

  // two layers of domain warping give the long, folding veil shapes
  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 1.7 + uWarp * 2.0 * q + vec2(1.7, 9.2) + 0.5 * t),
                fbm(p * 1.7 + uWarp * 2.0 * q + vec2(8.3, 2.8) - 0.4 * t));
  float f = fbm(p * 1.5 + uWarp * 2.4 * r);

  vec3 deep = vec3(0.010, 0.012, 0.040);
  vec3 navy = vec3(0.060, 0.110, 0.400);
  vec3 violet = vec3(0.260, 0.120, 0.500);

  vec3 col = mix(deep, navy, smoothstep(0.25, 0.80, f));
  // only a little violet, where the two warp layers cross
  col = mix(col, violet, smoothstep(0.40, 0.90, r.x * 1.25) * 0.42);
  // soft bright thread along the folds
  col += navy * 0.55 * smoothstep(0.62, 0.78, f) * (1.0 - smoothstep(0.78, 0.92, f));

  // keep the edges and the very top dark so copy and the menu stay readable
  float vig = smoothstep(1.25, 0.15, length((uv - vec2(0.5, 0.5)) * vec2(1.0, 1.15)));
  col *= 0.55 + 0.45 * vig;

  col *= 1.0 - uScan * (0.5 + 0.5 * sin(gl_FragCoord.y * uScanFreq));
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * uNoise * 0.06;

  col = hueShift(col, uHueShift);
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function DarkVeil({
  hueShift = 0,
  noiseIntensity = 0.6,
  scanlineIntensity = 0,
  speed = 1,
  scanlineFrequency = 2,
  warpAmount = 0.5,
  resolutionScale = 0.5,
  maxFps = 30,
  className = '',
}: DarkVeilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ hueShift, noiseIntensity, scanlineIntensity, speed, scanlineFrequency, warpAmount });
  propsRef.current = { hueShift, noiseIntensity, scanlineIntensity, speed, scanlineFrequency, warpAmount };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 2) * Math.min(1, Math.max(0.3, resolutionScale)), alpha: false });
    } catch {
      return undefined; // no WebGL: the page just shows its plain dark background
    }
    const gl = renderer.gl;
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
        uHueShift: { value: hueShift },
        uNoise: { value: noiseIntensity },
        uScan: { value: scanlineIntensity },
        uScanFreq: { value: scanlineFrequency },
        uWarp: { value: warpAmount },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      draw(0);
    };

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const minFrameMs = 1000 / maxFps;
    let time = 0;
    let last = performance.now();
    let frame = 0;

    function draw(dt: number) {
      const p = propsRef.current;
      time += dt * p.speed;
      program.uniforms.uTime.value = time;
      program.uniforms.uHueShift.value = p.hueShift;
      program.uniforms.uNoise.value = p.noiseIntensity;
      program.uniforms.uScan.value = p.scanlineIntensity;
      program.uniforms.uScanFreq.value = p.scanlineFrequency;
      program.uniforms.uWarp.value = p.warpAmount;
      renderer.render({ scene: mesh });
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const elapsed = now - last;
      if (elapsed < minFrameMs) return;
      last = now;
      draw(Math.min(elapsed, 100) / 1000);
    };
    const start = () => {
      if (!frame && !reducedMotion) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [resolutionScale, maxFps]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none block h-full w-full ${className}`} />;
}
