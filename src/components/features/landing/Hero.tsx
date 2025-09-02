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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 w-full relative">
        {/* Header Section - Left aligned */}
        <div className="mb-8">
          <Reveal delayMs={80}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
              DTP Attendance System
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
              University of Mindanao Digos College
            </p>
          </Reveal>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Light divider between columns on desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

          {/* Left Content - Student Registration */}
          <Reveal delayMs={160}>
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-medium">
                <Users className="size-4" />
                <span>For Students & Attendees</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Join Events with
                <span className="text-blue-600"> One Scan</span>
              </h2>

              <p className="text-base text-gray-600 leading-relaxed max-w-xl">
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

              {/* Student CTA */}
              <div className="pt-2">
                <Button
                  className="h-12 px-6 text-base bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 group"
                  asChild
                >
                  <Link href="/join">
                    Join Event Now
                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Right Content - Staff Login */}
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

              {/* Staff CTA */}
              <div className="pt-2">
                <Button
                  className="h-12 px-6 text-base bg-yellow-500 text-black hover:bg-yellow-600 shadow-md hover:shadow-lg transition-all duration-200 group"
                  asChild
                >
                  <Link href="/auth/login">
                    Sign In to Dashboard
                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
