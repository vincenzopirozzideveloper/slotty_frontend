"use client"

import { useRef, ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  from?: number
}

export function ScaleIn({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  from = 0.8,
}: ScaleInProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        scale: from,
      },
      {
        opacity: 1,
        scale: 1,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    )
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
