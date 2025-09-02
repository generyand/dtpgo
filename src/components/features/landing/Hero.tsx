import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/Reveal";
import { HERO } from "@/lib/content/landing";
import {
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  BarChart3,
  Zap,
  GraduationCap,
  Shield,
} from "lucide-react";

export function Hero() {
  return (
    <section
      className="relative bg-white min-h-[calc(100vh-4rem)] flex items-center overflow-hidden"
      id="home"
    >
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-yellow-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

      {/* Mobile sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t sm:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Button className="flex-1 h-12 bg-blue-700 text-white hover:bg-blue-800 shadow" asChild>
            <Link href="/join" aria-label="Start registration" prefetch>
              Get My QR Code
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
            aria-label="Staff login"
            prefetch={false}
          >
            Staff Login
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 w-full relative">
        {/* Header Section - Centered title and description only */}
        <div className="mb-10 text-center">
          <Reveal delayMs={60}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
              DTP Attendance System
            </h1>
          </Reveal>
          <Reveal delayMs={100}>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Register here to get your QR code for event attendance.
            </p>
          </Reveal>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Light divider between columns on desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

          {/* Left Content - Student Registration (Primary CTA) */}
          <Reveal delayMs={160}>
            <div className="space-y-5 pb-16 sm:pb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-medium">
                <Users className="size-4" />
                <span>For Students & Attendees</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Join Events with
                <span className="text-blue-600"> One Scan</span>
              </h2>

              <p className="text-base text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Register for events and get your unique QR code. Simply present it at check-in for instant attendance recording.
              </p>

              {/* Key Benefits */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">No app installation required</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Instant QR code generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Real-time attendance tracking</span>
                </div>
              </div>

              {/* Primary Student CTA */}
              <div className="pt-2">
                <Button
                  className="h-12 px-6 text-base bg-blue-700 text-white hover:bg-blue-800 shadow"
                  asChild
                >
                  <Link href="/join" aria-label="Get my QR code" prefetch>
                    Get My QR Code
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                {/* Inline admin link for quick access on mobile */}
                <div className="mt-2 sm:hidden">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline"
                    aria-label="Staff login"
                    prefetch={false}
                  >
                    <Shield className="size-4 mr-1" /> Staff Login
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Content - Staff Login (Secondary link) */}
          <Reveal direction="left" delayMs={240}>
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-800 text-xs font-medium">
                <Shield className="size-4" />
                <span>For Staff & Organizers</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Manage Events
                <span className="text-yellow-600"> Seamlessly</span>
              </h2>

              <p className="text-base text-gray-600 leading-relaxed max-w-xl">
                Access your admin dashboard to create events, track attendance, and generate reports in real-time.
              </p>

              {/* Key Benefits */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Create and manage events</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Real-time attendance monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Export detailed reports</span>
                </div>
              </div>

              {/* Subtle Admin Link */}
              <div className="hidden sm:block">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline"
                  aria-label="Staff login"
                  prefetch={false}
                >
                  <Shield className="size-4 mr-1" /> Staff Login
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
