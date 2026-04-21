import type { Metadata } from 'next';
import type { Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false });

export const metadata: Metadata = {
    title: 'الرفيق — منصة الخدمات المتعددة',
    description: 'منصة جزائرية لحجز المنازل، الفنادق، طلب المأكولات التقليدية، وسيارات الأجرة',
    keywords: ['الرفيق', 'حجز منازل', 'الجزائر', 'كراء شقق', 'حجز فنادق'],
};

export const viewport: Viewport = {
    themeColor: '#020617',
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className="min-h-screen bg-[#020617] text-white selection:bg-[#C6A75E]/30 font-sans relative antialiased overflow-x-hidden">
                <div className="relative z-10 w-full">
                    {children}
                </div>
                <ChatWidget />
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            fontFamily: 'inherit',
                            direction: 'rtl',
                        },
                    }}
                />
            </body>
        </html>
    );
}

