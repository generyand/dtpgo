"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NAV_LINKS, NAV_CTA_TEXT, ORG } from "@/lib/content/landing"
import { Menu, X, ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"

export function HeaderNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image 
                src={ORG.logoSrc} 
                alt="DTP" 
                width={44} 
                height={44} 
                className="relative rounded-full border-2 border-gray-100 shadow-sm group-hover:border-yellow-200 transition-colors" 
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-gray-900 text-lg group-hover:text-gray-800 transition-colors">{ORG.name}</div>
              <div className="text-xs text-gray-500 -mt-1">{ORG.college}</div>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link 
                key={l.href} 
                href={l.href} 
                className="relative text-gray-600 hover:text-gray-900 font-medium transition-colors group py-2"
              >
                {l.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Enhanced CTA Section */}
          <div className="flex items-center gap-3">
            {/* Sign In Button - Hidden on mobile */}
            <Button 
              variant="ghost" 
              className="hidden md:inline-flex text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              asChild
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            
            {/* Main CTA Button */}
            <Button 
              className="bg-yellow-400 text-black hover:bg-yellow-500 shadow-md hover:shadow-lg transition-all duration-200 group" 
              asChild
            >
              <Link href="#demo">
                <Sparkles className="size-4 mr-2" />
                {NAV_CTA_TEXT}
                <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 bg-white/95 backdrop-blur-xl">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link 
                  key={l.href} 
                  href={l.href} 
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-gray-100">
                <Link 
                  href="/auth/login"
                  className="block text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}


