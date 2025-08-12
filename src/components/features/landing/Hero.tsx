import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/Reveal"
import { HERO } from "@/lib/content/landing"

export function Hero() {
  return (
    <section className="relative" id="home">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <Reveal delayMs={80}>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{HERO.headline}</h1>
          <p className="mt-4 text-lg text-neutral-700">{HERO.subheadline}</p>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-700">
            <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-green-500" /> Real‑time attendance tracking</li>
            <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-green-500" /> QR code check‑ins</li>
            <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-green-500" /> One dashboard for every event</li>
            <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-green-500" /> Exportable reports</li>
          </ul>
          <div className="mt-8 flex gap-3">
            <Button className="h-12 px-6 text-base bg-yellow-400 text-black hover:bg-yellow-500" asChild>
              <Link href={HERO.ctaHref}>{HERO.ctaText}</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal direction="left" delayMs={160} className="relative">
          <div className="relative aspect-[4/3] w-full rounded-xl border bg-neutral-50 overflow-hidden">
            <Image src={HERO.imageSrc} alt="Attendance dashboard preview" fill priority className="object-cover object-bottom" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}


