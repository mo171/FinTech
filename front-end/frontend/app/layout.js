import { Inter } from 'next/font/google'
import { UserProvider } from '@/context/UserContext'
import { Toaster } from 'sonner'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ComplianceAI - AI-Powered Banking Compliance Assistant',
  description: 'Streamline your banking compliance workflows with AI-powered automation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Navbar />
          {children}
          <Toaster position="top-right" richColors />
        </UserProvider>
      </body>
    </html>
  )
}
