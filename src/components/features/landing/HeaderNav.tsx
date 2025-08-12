import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NAV_LINKS, NAV_CTA_TEXT, ORG } from "@/lib/content/landing"

export function HeaderNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-3">
          <Image src={ORG.logoSrc} alt="DTP" width={40} height={40} className="rounded-full" />
          <span className="font-semibold">{ORG.name}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:opacity-80">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button className="bg-yellow-400 text-black hover:bg-yellow-500" asChild>
            <Link href="#demo">{NAV_CTA_TEXT}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}


