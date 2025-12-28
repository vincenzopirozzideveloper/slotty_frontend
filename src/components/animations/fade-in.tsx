"use client"

import { useRef, ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface FadeInProps {
  children: ReactNode
  direction?: "up" | "down" | "left" | "right" | "none"
  delay?: number
  duration?: number
  className?: string
  stagger?: number
  once?: boolean
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  className = "",
  stagger = 0,
  once = true,
}: FadeInProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const getTransform = () => {
    switch (direction) {
      case "up":
        return { y: 60 }
      case "down":
        return { y: -60 }
      case "left":
        return { x: 60 }
      case "right":
        return { x: -60 }
      default:
        return {}
    }
  }

  useGSAP(() => {
    if (!containerRef.current) return

    const elements = containerRef.current.children.length > 1
      ? containerRef.current.children
      : containerRef.current

    gsap.fromTo(
      elements,
      {
        opacity: 0,
        ...getTransform(),
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: once ? "play none none none" : "play reverse play reverse",
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
