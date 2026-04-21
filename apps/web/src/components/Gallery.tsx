'use client';

import { useState } from 'react';

interface GalleryProps {
    images: Array<{ url: string; thumbnailUrl: string; altText?: string }>;
}

export default function Gallery({ images }: GalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Layout: 1 large image + 4 smaller images in a grid
    const mainImage = images[0]?.url || '/images/placeholder-listing.jpg';
    const sideImages = images.slice(1, 5);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[400px] md:h-[600px] overflow-hidden rounded-[32px]">
                {/* Large Main Image */}
                <div className="md:col-span-2 relative group cursor-pointer overflow-hidden" onClick={() => setSelectedImage(mainImage)}>
                    <img
                        src={mainImage}
                        alt="صورة العقار الرئيسية"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                </div>

                {/* Side Grid */}
                <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3 h-full">
                    {sideImages.map((img, idx) => (
                        <div 
                            key={idx} 
                            className="relative group cursor-pointer overflow-hidden"
                            onClick={() => setSelectedImage(img.url)}
                        >
                            <img
                                src={img.url}
                                alt={`صورة فرعية ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                            
                            {/* "Show more" overlay on the last image */}
                            {idx === 3 && images.length > 5 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold backdrop-blur-sm">
                                    +{images.length - 5} صور إضافية
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Fill empty slots if less than 5 images */}
                    {[...Array(Math.max(0, 4 - sideImages.length))].map((_, i) => (
                        <div key={`empty-${i}`} className="bg-white/5 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal (Simplified) */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-8 left-8 text-white text-4xl hover:text-[#C6A75E]">✕</button>
                    <img 
                        src={selectedImage} 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                        alt="عرض الصورة" 
                    />
                </div>
            )}
        </div>
    );
}
