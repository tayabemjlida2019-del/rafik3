'use client';

import { useState } from 'react';

interface GalleryProps {
    images: Array<{ url: string; thumbnailUrl: string; altText?: string }>;
}

export default function Gallery({ images }: GalleryProps) {
    const [mainImage, setMainImage] = useState(images[0]?.url || 'https://placehold.co/800x600?text=No+Image');

    return (
        <div className="space-y-6">
            {/* Main Image */}
            <div className="relative h-[650px] w-full rounded-[40px] overflow-hidden bg-[#111827] group border-[12px] border-white shadow-2xl">
                <img
                    src={mainImage}
                    alt="Listing Main Image"
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex items-center gap-4 py-2 overflow-x-auto no-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainImage(img.url)}
                            className={`relative w-24 h-24 shrink-0 rounded-[20px] overflow-hidden border-2 transition-all duration-500 hover:scale-105 ${mainImage === img.url ? 'border-[#833AB4] scale-105 shadow-lg' : 'border-white hover:border-gray-200'
                                }`}
                        >
                            <img
                                src={img.thumbnailUrl || img.url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
