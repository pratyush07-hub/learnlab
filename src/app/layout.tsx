import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LearnLab - Premium Research Mentorship Platform',
  description: 'Connect with expert mentors for personalized research guidance. Ages 9-19.',
  icons: {
    icon: 'https://tepysveqbchnyjkeyjnh.supabase.co/storage/v1/object/public/skillorbitx/logo.png',
    shortcut: 'https://tepysveqbchnyjkeyjnh.supabase.co/storage/v1/object/public/skillorbitx/logo.png',
    apple: 'https://tepysveqbchnyjkeyjnh.supabase.co/storage/v1/object/public/skillorbitx/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://tepysveqbchnyjkeyjnh.supabase.co/storage/v1/object/public/skillorbitx/logo.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}