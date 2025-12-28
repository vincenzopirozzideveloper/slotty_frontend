"use client"

import { useRef, ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
  direction?: "vertical" | "horizontal"
}

export function Parallax({
  children,
  speed = 0.5,
  className = "",
  direction = "vertical",
}: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const movement = 100 * speed

    gsap.to(containerRef.current, {
      [direction === "vertical" ? "y" : "x"]: -movement,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
