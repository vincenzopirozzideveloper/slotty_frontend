"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"

interface InfiniteMarqueeProps {
  children: React.ReactNode
  speed?: number
  direction?: "left" | "right"
  className?: string
  pauseOnHover?: boolean
}

export function InfiniteMarquee({
  children,
  speed = 50,
  direction = "left",
  className = "",
  pauseOnHover = true,
}: InfiniteMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return

    const scroller = scrollerRef.current
    const scrollerContent = Array.from(scroller.children)

    // Clone items for seamless loop
    scrollerContent.forEach((item) => {
      const clone = item.cloneNode(true)
      scroller.appendChild(clone)
    })

    const totalWidth = scroller.scrollWidth / 2
    const duration = totalWidth / speed

    // Set initial position for right direction
    if (direction === "right") {
      gsap.set(scroller, { x: -totalWidth })
    }

    // Create infinite animation
    animationRef.current = gsap.to(scroller, {
      x: direction === "left" ? -totalWidth : 0,
      duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => {
          const xNum = parseFloat(x)
          if (direction === "left") {
            return xNum % totalWidth
          } else {
            return ((xNum % totalWidth) - totalWidth)
          }
        }),
      },
    })

    // Pause on hover
    if (pauseOnHover) {
      const container = containerRef.current
      const handleMouseEnter = () => animationRef.current?.pause()
      const handleMouseLeave = () => animationRef.current?.resume()

      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
        animationRef.current?.kill()
      }
    }

    return () => {
      animationRef.current?.kill()
    }
  }, [speed, direction, pauseOnHover])

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
    >
      <div
        ref={scrollerRef}
        className="flex gap-8 w-max"
      >
        {children}
      </div>
    </div>
  )
}
