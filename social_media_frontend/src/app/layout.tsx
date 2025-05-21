import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/redux/provider';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Social Media App',
  description: 'A social media platform for connecting with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          
            <AuthProvider>
            {children}
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
