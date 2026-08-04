import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { SiteProvider } from '@/context/SiteContext';
import { ToastProvider } from '@/context/ToastContext';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LocaleProvider } from '@/context/LocaleContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIChatWidget from '@/components/AIChatWidget';
import ToastViewport from '@/components/ToastViewport';

const body = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const display = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Drinks — Fresh drinks, fast delivery',
  description:
    'Coffee, tea, juice & smoothies. Fast delivery, Stripe checkout.',
};

const themeBootScript = `(function(){try{var t=localStorage.getItem('drinks-theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}var l=localStorage.getItem('drinks-locale');if(l==='en'||l==='vi')document.documentElement.lang=l}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${body.variable} ${display.variable} font-body antialiased`}>
        <ThemeProvider>
          <LocaleProvider>
            <ToastProvider>
              <ConfirmProvider>
                <AuthProvider>
                  <SiteProvider>
                    <CartProvider>
                      <WishlistProvider>
                        <div className="flex min-h-screen flex-col">
                          <Navbar />
                          <main className="flex-1">{children}</main>
                          <Footer />
                        </div>
                        <AIChatWidget />
                        <ToastViewport />
                      </WishlistProvider>
                    </CartProvider>
                  </SiteProvider>
                </AuthProvider>
              </ConfirmProvider>
            </ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
