'use client'

import {useEffect, useRef} from 'react'

const VERTEX_SRC = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

const FRAGMENT_SRC = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dark;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 aspectUv = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0);
  float t = u_time * 0.06;

  vec2 drift = (u_pointer - 0.5) * 0.06;
  float wave = 0.0;
  wave += noise(aspectUv * 2.2 + vec2(t, -t * 0.7) + drift);
  wave += 0.5 * noise(aspectUv * 4.0 - vec2(t * 0.5, t) + drift);
  wave *= 0.66;

  float pulse = 0.5 + 0.5 * sin(u_time * 0.25);
  float glow = smoothstep(0.9, 0.0, length(aspectUv)) * (0.35 + 0.15 * pulse);

  vec3 lightBase = mix(vec3(0.996, 0.984, 0.969), vec3(0.937, 0.361, 0.047), wave * 0.28);
  vec3 darkBase = mix(vec3(0.09, 0.09, 0.09), vec3(0.55, 0.22, 0.08), wave * 0.35);
  vec3 base = mix(lightBase, darkBase, u_dark);

  vec3 color = base + glow * vec3(0.93, 0.36, 0.05) * (1.0 - u_dark * 0.4);
  gl_FragColor = vec4(color, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gl = reducedMotion ? null : (canvas.getContext('webgl') as WebGLRenderingContext | null)
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const posBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const posLoc = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const resLoc = gl.getUniformLocation(program, 'u_res')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const pointerLoc = gl.getUniformLocation(program, 'u_pointer')
    const darkLoc = gl.getUniformLocation(program, 'u_dark')

    const pointer = {x: 0.5, y: 0.5}
    let targetPointer = {x: 0.5, y: 0.5}

    function onPointerMove(e: PointerEvent) {
      targetPointer = {x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight}
    }
    window.addEventListener('pointermove', onPointerMove, {passive: true})

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    function resize() {
      if (!canvas) return
      canvas.width = Math.floor(canvas.clientWidth * dpr)
      canvas.height = Math.floor(canvas.clientHeight * dpr)
      gl!.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    const start = performance.now()
    function frame(now: number) {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0
      pointer.x += (targetPointer.x - pointer.x) * 0.03
      pointer.y += (targetPointer.y - pointer.y) * 0.03
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height)
      gl!.uniform1f(timeLoc, (now - start) / 1000)
      gl!.uniform2f(pointerLoc, pointer.x, pointer.y)
      gl!.uniform1f(darkLoc, dark)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="ambient-fallback absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
