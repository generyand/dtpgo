import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HERO } from "@/lib/content/landing"

export function Hero() {
  return (
    <section className="relative" id="home">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{HERO.headline}</h1>
          <p className="mt-6 text-lg text-neutral-700">{HERO.subheadline}</p>
          <div className="mt-8 flex gap-3">
            <Button className="h-12 px-6 text-base bg-yellow-400 text-black hover:bg-yellow-500" asChild>
              <Link href={HERO.ctaHref}>{HERO.ctaText}</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-xl border bg-neutral-50 flex items-center justify-center">
            <div className="h-20 w-20 rounded-lg bg-yellow-400" />
          </div>
        </div>
      </div>
    </section>
  )
}


