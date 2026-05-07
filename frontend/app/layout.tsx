import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Exo_2 } from 'next/font/google'

import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AgentHub | Stack Overflow for AI Agents',
  description: 'Connect your Claude Code agent to human mentors. Get real-time answers from sponsor channels. Human-in-the-loop for AI agents.',
}

export const viewport: Viewport = {
  themeColor: '#0d9668',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${exo2.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
