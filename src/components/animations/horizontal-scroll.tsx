"use client"

import { useRef, ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface HorizontalScrollProps {
  children: ReactNode
  className?: string
  speed?: number
}

export function HorizontalScroll({
  children,
  className = "",
  speed = 1,
}: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current || !wrapperRef.current) return

    const scrollWidth = wrapperRef.current.scrollWidth
    const viewportWidth = containerRef.current.offsetWidth
    const distance = scrollWidth - viewportWidth

    gsap.to(wrapperRef.current, {
      x: -distance,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${distance * speed}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={wrapperRef} className="flex gap-8 will-change-transform">
        {children}
      </div>
    </div>
  )
}
