"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export function ShaderAnimation({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
     
    uniforms: any
    animationId: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    // Fragment shader customized for White and Blue Pranata aesthetic
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        // Time is in seconds. We want a pulse every 3.0 seconds.
        float t = time / 3.0;
        float lineWidth = 0.002;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
          }
        }
        
        // Calculate intensity based on the original rgb pattern
        float intensity = (color.r + color.g + color.b) / 3.0;
        
        // Map to Transparent and Earthy Orange
        vec4 bgTransparent = vec4(0.0, 0.0, 0.0, 0.0);
        vec4 brandOrange = vec4(0.96, 0.60, 0.05, 1.0); // Vibrant Orange #F5990D
        
        // Smooth mapping
        float mappedIntensity = smoothstep(0.0, 1.0, intensity * 2.5);
        
        // Mask out the center of the screen so text is completely readable!
        // uv is (0,0) at the center. 
        float dist = length(uv);
        // smoothstep(innerRadius, outerRadius, distance)
        // 0.0 inside 0.6, fades to 1.0 at 1.2
        float mask = smoothstep(0.6, 1.2, dist); 
        
        mappedIntensity *= mask;
        
        vec4 finalColor = mix(bgTransparent, brandOrange, mappedIntensity);
        
        gl_FragColor = finalColor;
      }
    `

    // Initialize Three.js scene
    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)

    container.appendChild(renderer.domElement)

    // Handle window resize
    const onWindowResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }

    // Initial resize
    onWindowResize()
    window.addEventListener("resize", onWindowResize, { passive: true })

    // Track real time so it's not frame-rate dependent!
    const startTime = performance.now()

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate)
      // Time is now exact elapsed seconds
      uniforms.time.value = (performance.now() - startTime) / 1000.0
      renderer.render(scene, camera)

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId
      }
    }

    // Store scene references for cleanup
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    }

    // Start animation
    animate()

    // Cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize)

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)

        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement)
        }

        sceneRef.current.renderer.dispose()
        geometry.dispose()
        material.dispose()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full", className)}
      style={{ overflow: "hidden" }}
    />
  )
}
