"use client"

import React from "react"
import { cn } from "@/lib/utils"

type Direction = "up" | "down" | "left" | "right"

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: Direction
  delayMs?: number
  once?: boolean
}

export function Reveal({
  children,
  className,
  direction = "up",
  delayMs = 0,
  once = true,
  ...rest
}: RevealProps) {
  const [visible, setVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [once])

  const translateMap: Record<Direction, string> = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
  }

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transition-all duration-1000 ease-out will-change-transform will-change-opacity motion-reduce:transition-none motion-reduce:transform-none",
        visible ? "opacity-100 translate-x-0 translate-y-0" : cn("opacity-0", translateMap[direction]),
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}


