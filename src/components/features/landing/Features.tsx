import Image from "next/image"
import { FEATURES } from "@/lib/content/landing"
import { Check } from "lucide-react"
import { Reveal } from "@/components/ui/Reveal"

export function Features() {
  return (
    <section id="features" className="relative bg-gradient-to-b from-neutral-50 to-white border-y">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Powerful Features Designed for Accuracy and Simplicity.</h2>
        <p className="text-gray-600 max-w-2xl">Everything you need to modernize attendance tracking and streamline your events.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delayMs={120 + i * 120}>
            <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute -right-10 -top-10 size-24 rounded-full bg-yellow-400/10 blur-xl group-hover:bg-yellow-400/15 transition-colors" />
              <div className="p-6">
                <div className="h-36 w-full rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 mb-4 flex items-center justify-center border transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-md">
                  <Image src={f.iconSrc} alt={f.iconAlt ?? f.title} width={96} height={96} className="transition-transform group-hover:scale-105" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-gray-800 transition-colors">{f.title}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{f.description}</p>
                {f.bullets && (
                  <ul className="mt-4 space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="size-5 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Check className="size-3 text-yellow-600" />
                        </div>
                        <span className="font-medium">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="h-1 w-0 bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 group-hover:w-full" />
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}


