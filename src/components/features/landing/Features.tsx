import Image from "next/image"
import { FEATURES } from "@/lib/content/landing"
import { Check } from "lucide-react"
import { Reveal } from "@/components/ui/Reveal"

export function Features() {
  return (
    <section id="features" className="relative bg-neutral-50 border-y">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold">Powerful Features Designed for Accuracy and Simplicity.</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delayMs={120 + i * 120}>
            <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="absolute -right-10 -top-10 size-24 rounded-full bg-yellow-400/10 blur-xl" />
              <div className="p-6">
                <div className="h-36 w-full rounded-lg bg-neutral-50 mb-4 flex items-center justify-center border transition-transform group-hover:scale-[1.02]">
                  <Image src={f.iconSrc} alt={f.iconAlt ?? f.title} width={96} height={96} />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-neutral-700 text-sm">{f.description}</p>
                {f.bullets && (
                  <ul className="mt-3 space-y-1.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-neutral-700">
                        <Check className="size-4 text-yellow-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="h-1 w-0 bg-yellow-400 transition-all group-hover:w-full" />
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}


