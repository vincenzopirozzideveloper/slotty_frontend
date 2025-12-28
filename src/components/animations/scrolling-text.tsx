"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface ScrollingTextProps {
  text: string
  direction?: "left" | "right"
  speed?: number
  className?: string
  textClassName?: string
  repeat?: number
}

export function ScrollingText({
  text,
  direction = "left",
  speed = 1,
  className = "",
  textClassName = "",
  repeat = 4,
}: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current || !textRef.current) return

    const textWidth = textRef.current.offsetWidth / repeat
    const movement = direction === "left" ? -textWidth : textWidth

    gsap.to(textRef.current, {
      x: movement,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: speed,
      },
    })
  }, { scope: containerRef })

  const repeatedText = Array(repeat).fill(text).join(" — ")

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
    >
      <div
        ref={textRef}
        className={`inline-block will-change-transform ${textClassName}`}
        style={{ x: direction === "right" ? `-${100 / repeat}%` : 0 }}
      >
        {repeatedText} —{" "}
      </div>
    </div>
  )
}
