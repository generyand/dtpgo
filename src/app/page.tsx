"use client";

import { HeaderNav, Hero, Features, HowItWorks, FinalCta, Faq, Footer } from "@/components/features/landing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <HeaderNav />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <FinalCta />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
