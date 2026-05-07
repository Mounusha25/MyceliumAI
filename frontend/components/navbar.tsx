"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/channels", label: "Forums", live: true },
  { href: "/dashboard", label: "Impact" },
  { href: "/mentors", label: "Escalations" },
  { href: "/fetch", label: "Fetch.ai" },
  { href: "/api/docs", label: "Docs", external: true },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            hack<span className="text-primary">overflow</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const Tag = link.external ? 'a' : Link
            return (
              <Tag
                key={link.href}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <span className="flex items-center gap-1.5">
                  {link.label}
                  {link.live && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                  )}
                </span>
              </Tag>
            )
          })}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-0.5 p-3">
            {navLinks.map((link) => {
              const Tag = link.external ? 'a' : Link
              return (
                <Tag
                  key={link.href}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    pathname === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  {link.label}
                </Tag>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
