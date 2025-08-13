import Image from "next/image"
import Link from "next/link"
import { FOOTER, ORG } from "@/lib/content/landing"
import { Mail, Phone, Globe, ShieldCheck, Facebook, Lock, CheckCircle2, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand with two logos */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm" />
                <Image src="/img/um.webp" alt="UM Digos College" width={56} height={56} className="relative rounded-full bg-white p-1 shadow-lg" />
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm" />
                <Image src={ORG.logoSrc} alt="DTP" width={56} height={56} className="relative rounded-full bg-white p-1 shadow-lg" />
              </div>
            </div>
            <div>
              <p className="font-bold text-xl text-white">{ORG.name}</p>
              <p className="text-gray-300 font-medium">{ORG.college}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300 space-y-1">
                    {FOOTER.address?.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-4">
            <h4 className="font-bold text-yellow-400 text-lg mb-4">Contact & Support</h4>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5 shadow-lg backdrop-blur-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <Mail className="size-4 text-yellow-400" />
                  </div>
                  <a href={`mailto:${FOOTER.contactEmail}`} className="hover:text-yellow-400 transition-colors break-all text-sm">{FOOTER.contactEmail}</a>
                </div>
                {FOOTER.contactPhone && (
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                      <Phone className="size-4 text-yellow-400" />
                    </div>
                    <span className="text-sm">{FOOTER.contactPhone}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <ShieldCheck className="size-4" />
                  <span>Secure & Verified Platform</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Connected */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-yellow-400 text-lg mb-4">Stay Connected</h4>
            <p className="text-sm text-gray-300 mb-4">Follow us for updates and announcements</p>
            <div className="flex items-center gap-3 mb-6">
              {FOOTER.socials?.map((s) => {
                const isFacebook = s.type === "facebook"
                const Icon = isFacebook ? Facebook : Globe
                const className = cn(
                  "inline-flex items-center justify-center size-12 rounded-xl transition-all duration-200 hover:scale-105",
                  isFacebook
                    ? "bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/25 border border-[#1877F2]/20"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                )
                return (
                  <Link key={s.label} href={s.href} className={className} target="_blank" rel="noreferrer">
                    <Icon className="size-5" />
                    <span className="sr-only">{s.label}</span>
                  </Link>
                )
              })}
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Users className="size-4 text-yellow-400" />
                <span>500+ Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 className="size-4 text-green-400" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="size-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">System Online</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Lock className="size-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-blue-400" />
              <span className="text-blue-400 font-medium">GDPR Compliant</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <p>© {year} {ORG.name}. All rights reserved.</p>
              <span className="hidden sm:inline">•</span>
              <p>Developed by <span className="text-yellow-400 font-medium">GEVIAS</span></p>
            </div>
            <div className="flex items-center gap-6">
              {FOOTER.legal.map((l) => (
                <Link key={l} href="#" className="hover:text-yellow-400 transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


