"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NAV_LINKS, ORG } from "@/lib/content/landing"
import { Menu, X, Shield, Users } from "lucide-react"
import { useState } from "react"

export function HeaderNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-sm">
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
            <div className="block">
              <div className="font-bold text-gray-900 text-sm sm:text-lg group-hover:text-gray-800 transition-colors leading-tight">{ORG.name}</div>
              <div className="text-xs text-gray-500 -mt-0.5 sm:-mt-1">{ORG.college}</div>
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

          {/* Enhanced CTA Section - Two Clear Buttons */}
          <div className="flex items-center gap-3">
            {/* Join Button - For Students */}
            <Button 
              variant="ghost" 
              className="hidden md:inline-flex text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              asChild
            >
              <Link href="/join" className="flex items-center gap-2">
                <Users className="size-4" />
                Join Event
              </Link>
            </Button>
            
            {/* Sign In Button - For Staff */}
            <Button 
              className="hidden md:inline-flex bg-yellow-500 text-black hover:bg-yellow-600 shadow-sm"
              asChild
            >
              <Link href="/auth/login" className="flex items-center gap-2">
                <Shield className="size-4" />
                Sign In
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
              
              {/* Mobile CTA Buttons */}
              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                <Link 
                  href="/join"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users className="size-4" />
                  Join Event
                </Link>
                <Link 
                  href="/auth/login"
                  className="flex items-center gap-2 bg-yellow-500 text-black hover:bg-yellow-600 font-medium py-3 px-4 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="size-4" />
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


