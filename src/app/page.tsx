"use client";

import { HeaderNav, Hero, Features, HowItWorksUser, HowItWorks, Faq, Footer } from "@/components/features/landing";

export default function Home() {
  return (
    <div id="top" className="min-h-screen flex flex-col bg-white text-black">
      <HeaderNav />
      <main className="flex-1 pt-16">
        <Hero />
        <Features />
        <HowItWorksUser />
        <HowItWorks />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
