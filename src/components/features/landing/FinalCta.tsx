import { Button } from "@/components/ui/button"
import { FINAL_CTA } from "@/lib/content/landing"
import { Reveal } from "@/components/ui/Reveal"
import { CheckCircle2 } from "lucide-react"

export function FinalCta() {
  return (
    <section id="get-started" className="bg-neutral-50 border-y">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          <Reveal delayMs={80} className="md:col-span-2">
            <h3 className="text-2xl font-bold">{FINAL_CTA.headline}</h3>
            <p className="mt-3 text-neutral-700">{FINAL_CTA.subheadline}</p>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FINAL_CTA.points?.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-neutral-700">
                  <CheckCircle2 className="size-4 text-green-500" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal direction="left" delayMs={200} className="text-center">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-neutral-600">Experience the platform</p>
              <Button className="mt-4 h-12 w-full px-6 text-base bg-yellow-400 text-black hover:bg-yellow-500">{FINAL_CTA.ctaText}</Button>
              <p className="mt-2 text-xs text-neutral-500">No commitment required</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}


