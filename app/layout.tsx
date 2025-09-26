import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'sonner';
import ChatButton from "@/components/ChatButton";
import Footer from '@/components/Footer';



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cash Vibe",
  description: "A next-generation digital marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen w-full" style={{
          background: 'radial-gradient(circle at top left, #291638, #130a1d 40%), radial-gradient(circle at bottom right, #4b1a5e, #1d0f2c 40%), linear-gradient(to bottom right, #190d24, #2d1241)',
          backgroundBlendMode: 'normal'
        }}>
          <div className="w-full">
            <AuthProvider>
              <Toaster position="top-right" richColors />
              {children}
              <ChatButton />
              <Footer />
            </AuthProvider>
          </div>
        </div>
        
		<!-- Snackeet -->
		<iframe
			src="https://snkt.io/68d680e66b20a591a1fd5e79?snkt_channel=iframe"
			allow="camera *; microphone *; autoplay *; encrypted-media *; fullscreen *;"
			style="display: block; width:359px; aspect-ratio:359/630;
			border: none; border-radius: 10px; background: transparent; margin: 0 auto"
		></iframe>
		<!-- End Snackeet -->
		
      </body>
    </html>
  );
}
