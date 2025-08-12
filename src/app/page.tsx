"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="#" className="flex items-center gap-3">
            <Image src="/logo/dtp.png" alt="DTP" width={40} height={40} className="rounded-full" />
            <span className="font-semibold">Department of Technical Programs</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#home" className="hover:opacity-80">Home</Link>
            <Link href="#features" className="hover:opacity-80">Features</Link>
            <Link href="#how-it-works" className="hover:opacity-80">How It Works</Link>
            <Link href="#faq" className="hover:opacity-80">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500" asChild>
              <Link href="#demo">Request a Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="home" className="flex-1">
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                Effortless Assembly Attendance. Instantly.
              </h1>
              <p className="mt-6 text-lg text-neutral-700">
                Say goodbye to manual roll calls and paper sheets. Our system provides fast, accurate, and
                real-time attendance tracking for all your department's events.
              </p>
              <div className="mt-8 flex gap-3">
                <Button className="h-12 px-6 text-base bg-yellow-400 text-black hover:bg-yellow-500" asChild>
                  <Link href="#get-started">Get Started Now</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Visual placeholder for dashboard mockup */}
              <div className="aspect-[4/3] w-full rounded-xl border bg-neutral-50 flex items-center justify-center">
                <div className="h-20 w-20 rounded-lg bg-yellow-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-neutral-50 border-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-2xl sm:text-3xl font-bold">Powerful Features Designed for Accuracy and Simplicity.</h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* F1 */}
              <div className="p-6 rounded-xl border bg-white">
                <div className="h-36 w-full rounded-lg bg-neutral-100 mb-4 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-md bg-yellow-400" />
                </div>
                <h3 className="font-semibold">Instant QR Code Check-in</h3>
                <p className="mt-2 text-neutral-700 text-sm">
                  Students and attendees scan a unique QR code upon entry. No more lines, no more manual
                  ticking, no more delays.
                </p>
              </div>
              {/* F2 */}
              <div className="p-6 rounded-xl border bg-white">
                <div className="h-36 w-full rounded-lg bg-neutral-100 mb-4 flex items-center justify-center">
                  <div className="h-12 w-24 rounded-md bg-yellow-400" />
                </div>
                <h3 className="font-semibold">Real-Time Attendance Dashboard</h3>
                <p className="mt-2 text-neutral-700 text-sm">
                  Monitor who has arrived and who is absent from a single screen. Accessible on any device—PC,
                  tablet, or phone.
                </p>
              </div>
              {/* F3 */}
              <div className="p-6 rounded-xl border bg-white">
                <div className="h-36 w-full rounded-lg bg-neutral-100 mb-4 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-yellow-400" />
                </div>
                <h3 className="font-semibold">Automated Report Generation</h3>
                <p className="mt-2 text-neutral-700 text-sm">
                  Instantly export detailed attendance records for assemblies and seminars. Perfect for
                  compliance and record-keeping.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-1 order-last lg:order-first">
              <ol className="space-y-6 list-decimal list-inside">
                <li>
                  <h4 className="font-semibold">Create Event</h4>
                  <p className="text-sm text-neutral-700">Add your assembly details to generate a unique, secure QR code.</p>
                </li>
                <li>
                  <h4 className="font-semibold">Scan to Attend</h4>
                  <p className="text-sm text-neutral-700">Display the QR code; attendees scan with their smartphone to be marked present.</p>
                </li>
                <li>
                  <h4 className="font-semibold">Track & Report</h4>
                  <p className="text-sm text-neutral-700">View live data and download the complete report when the event ends.</p>
                </li>
              </ol>
            </div>
            <div className="lg:col-span-2">
              <div className="aspect-[16/9] w-full rounded-xl border bg-neutral-50 flex items-center justify-center">
                <div className="h-24 w-40 rounded-lg bg-yellow-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="get-started" className="bg-neutral-50 border-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h3 className="text-2xl font-bold">Ready to Modernize Your Assembly Attendance?</h3>
            <p className="mt-3 text-neutral-700">
              Boost efficiency, ensure 100% accuracy, and provide a seamless experience for staff and students.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <Button className="h-12 px-6 text-base bg-yellow-400 text-black hover:bg-yellow-500">Request a Live Demo</Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
            <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is the system difficult to set up?</AccordionTrigger>
                <AccordionContent>
                  Not at all. The system is designed to be intuitive. You can create your first event and be
                  ready to accept check-ins in under 5 minutes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What do students need to check in?</AccordionTrigger>
                <AccordionContent>
                  All they need is a smartphone with a camera. No special app installation is required on their
                  end, making the process frictionless.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can this be used for events other than assemblies?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. It’s perfect for seminars, workshops, training sessions, and any event where you
                  need to track attendance accurately.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How secure is the attendance data?</AccordionTrigger>
                <AccordionContent>
                  The data is securely stored and accessible only to authorized administrators. Unique QR codes
                  prevent fraudulent check-ins.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start gap-4">
            <Image src="/logo/dtp.png" alt="DTP" width={48} height={48} className="rounded-full" />
            <div>
              <p className="font-semibold">Department of Technical Programs</p>
              <p className="text-sm opacity-80">UM Digos College</p>
              <p className="text-sm opacity-80">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold text-yellow-400">Contact</p>
              <ul className="mt-2 space-y-1 opacity-90">
                <li>department.email@umdigoscollege.edu.ph</li>
                <li>Department Phone Number</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-yellow-400">Legal</p>
              <ul className="mt-2 space-y-1 opacity-90">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
