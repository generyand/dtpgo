import Image from "next/image"
import Link from "next/link"
import { FOOTER, ORG } from "@/lib/content/landing"
import { Mail, Phone, Globe, ShieldCheck, Facebook, Lock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand with two logos */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo/um.png" alt="UM Digos College" width={56} height={56} className="rounded-full bg-white p-1" />
              <Image src={ORG.logoSrc} alt="DTP" width={56} height={56} className="rounded-full bg-white p-1" />
            </div>
            <div>
              <p className="font-semibold text-lg">{ORG.name}</p>
              <p className="text-sm opacity-80">{ORG.college}</p>
              <ul className="mt-3 text-sm opacity-80 space-y-1">
                {FOOTER.address?.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-4">
            <p className="font-semibold text-yellow-400">Contact & Support</p>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-yellow-400" />
                <a href={`mailto:${FOOTER.contactEmail}`} className="hover:underline break-all">{FOOTER.contactEmail}</a>
              </div>
              {FOOTER.contactPhone && (
                <div className="mt-2 flex items-center gap-3">
                  <Phone className="size-4 text-yellow-400" />
                  <span>{FOOTER.contactPhone}</span>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                <ShieldCheck className="size-4" />
                <span>Secure & Verified Platform</span>
              </div>
            </div>
          </div>

          {/* Stay Connected */}
          <div className="md:col-span-3">
            <p className="font-semibold text-yellow-400">Stay Connected</p>
            <p className="mt-3 text-sm opacity-80">Follow us for updates and announcements</p>
            <div className="mt-4 flex items-center gap-3">
              {FOOTER.socials?.map((s) => {
                const isFacebook = s.type === "facebook"
                const Icon = isFacebook ? Facebook : Globe
                const className = cn(
                  "inline-flex items-center justify-center size-10 rounded-full transition",
                  isFacebook
                    ? "bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/25"
                    : "bg-white/10 text-white hover:bg-white/20"
                )
                return (
                  <Link key={s.label} href={s.href} className={className} target="_blank" rel="noreferrer">
                    <Icon className="size-5" />
                    <span className="sr-only">{s.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-4 text-xs opacity-80">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="size-4" /> System Online</div>
            <div className="flex items-center gap-2 text-yellow-400"><Lock className="size-4" /> SSL Secured</div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p>© {year} {ORG.name}. All rights reserved.</p>
              <span className="hidden sm:inline">•</span>
              <p>Developed by GEVIAS</p>
            </div>
            <div className="flex items-center gap-4">
              {FOOTER.legal.map((l) => (
                <Link key={l} href="#" className="hover:underline">{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


