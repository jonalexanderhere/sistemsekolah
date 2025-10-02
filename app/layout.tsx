import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EduFace Cloud Pro - SISFOTJKT2',
  description: 'Sistem Informasi Sekolah TJKT 2 dengan Face Recognition',
  keywords: 'sekolah, face recognition, absensi, TJKT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

