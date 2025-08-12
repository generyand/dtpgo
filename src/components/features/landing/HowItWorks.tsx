"use client"

import Image from "next/image"
import { useState } from "react"
import { HOW_IT_WORKS } from "@/lib/content/landing"
import { QrCode, Smartphone, FileText, CheckCircle2 } from "lucide-react"
import { Reveal } from "@/components/ui/Reveal"

export function HowItWorks() {
  const icons = [QrCode, Smartphone, FileText]
  const gifs = ["/features/type.gif", "/features/scan.gif", "/features/analytics.gif"]
  const [activeIdx, setActiveIdx] = useState<number>(0)

  return (
    <section id="how-it-works" className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Header + Timeline (left column) */}
        <Reveal delayMs={80} className="lg:col-span-1 order-2 lg:order-1">
          <div className="mb-4 sm:mb-6 text-left">
            <p className="text-sm uppercase tracking-wide text-yellow-600">How it works</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold">Get up and running in 3 simple steps</h2>
          </div>
          <ol className="relative ml-1 pl-5 sm:ml-2 sm:pl-6 border-l border-neutral-200 dark:border-white/10 space-y-2 sm:space-y-3">
            {HOW_IT_WORKS.map((s, idx) => {
              const Icon = icons[idx] ?? CheckCircle2
              return (
                <li key={s.title} className="relative select-none">
                  <span className={`absolute -left-[11px] sm:-left-[13px] mt-2 sm:mt-3 inline-flex items-center justify-center size-5 sm:size-6 rounded-full text-[10px] sm:text-xs font-bold ring-8 ring-white ${activeIdx === idx ? "bg-yellow-400 text-black" : "bg-neutral-200 text-neutral-700"}`}>{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    aria-pressed={activeIdx === idx}
                    className={`w-full text-left flex items-center gap-3 rounded-lg p-2 sm:p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 ${activeIdx === idx ? "bg-yellow-50" : "bg-transparent"}`}
                  >
                    <span className={`mt-0.5 inline-flex items-center justify-center size-7 sm:size-8 rounded-lg ${activeIdx === idx ? "bg-yellow-400/20 text-yellow-700" : "bg-yellow-400/10 text-yellow-600"}`}>
                      <Icon className="size-4" />
                    </span>
                    <h4 className="font-semibold text-sm sm:text-base">{s.title}</h4>
                  </button>
                </li>
              )
            })}
          </ol>
        </Reveal>

        {/* Device mock */}
        <Reveal direction="left" delayMs={200} className="lg:col-span-2 order-1 lg:order-2">
          <div className="aspect-[16/9] w-full rounded-2xl border bg-neutral-50 shadow-sm p-4 sm:p-6 overflow-hidden">
            <div className="h-full w-full rounded-xl bg-white border p-4 grid grid-rows-[auto_1fr] overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-400" />
                  <span className="size-2 rounded-full bg-yellow-400" />
                  <span className="size-2 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-neutral-500">Live Preview</div>
              </div>
              {/* Screen */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-h-0">
                <div className="hidden md:block space-y-3 min-h-0">
                  {HOW_IT_WORKS.map((s, idx) => (
                    <div
                      key={s.title}
                      className={`rounded-lg border p-2 sm:p-3 transition-colors ${activeIdx === idx ? "bg-yellow-50 border-yellow-200" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-500" />
                        <p className="text-xs sm:text-sm font-medium">{idx + 1}. {s.title}</p>
                      </div>
                      <p className="text-[11px] sm:text-xs text-neutral-600 mt-1">{s.body}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center min-h-0">
                  <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[4/3] rounded-lg border bg-neutral-50 overflow-hidden mx-auto">
                    <Image src={gifs[activeIdx]} alt={HOW_IT_WORKS[activeIdx]?.title ?? "Preview"} fill className="object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  )
}


