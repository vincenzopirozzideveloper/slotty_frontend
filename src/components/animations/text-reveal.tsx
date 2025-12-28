"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface TextRevealProps {
  children: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  delay?: number
  splitBy?: "chars" | "words" | "lines"
}

export function TextReveal({
  children,
  className = "",
  as: Component = "span",
  delay = 0,
  splitBy = "words",
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const text = containerRef.current
    const content = text.textContent || ""

    let elements: string[] = []
    if (splitBy === "chars") {
      elements = content.split("")
    } else if (splitBy === "words") {
      elements = content.split(" ")
    } else {
      elements = [content]
    }

    text.innerHTML = elements
      .map((el, i) => {
        if (splitBy === "words" && i < elements.length - 1) {
          return `<span class="inline-block overflow-hidden"><span class="inline-block reveal-text">${el}</span></span> `
        }
        return `<span class="inline-block overflow-hidden"><span class="inline-block reveal-text">${el}</span></span>`
      })
      .join("")

    const revealTexts = text.querySelectorAll(".reveal-text")

    gsap.fromTo(
      revealTexts,
      {
        y: "100%",
        opacity: 0,
      },
      {
        y: "0%",
        opacity: 1,
        duration: 0.6,
        delay,
        stagger: 0.03,
        ease: "power3.out",
        scrollTrigger: {
          trigger: text,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    )
  }, { scope: containerRef })

  return (
    <Component ref={containerRef as any} className={className}>
      {children}
    </Component>
  )
}
