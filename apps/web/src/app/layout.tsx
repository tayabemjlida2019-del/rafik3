import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false });

export const metadata: Metadata = {
    title: 'الرفيق — منصة الخدمات المتعددة',
    description: 'منصة جزائرية لحجز المنازل، الفنادق، طلب المأكولات التقليدية، وسيارات الأجرة',
    keywords: ['الرفيق', 'حجز منازل', 'الجزائر', 'كراء شقق', 'حجز فنادق'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className="min-h-screen bg-gray-50">
                {children}
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

