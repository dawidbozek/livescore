'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BannerProps {
  imageUrl?: string;
  alt?: string;
  linkUrl?: string;
}

export function Banner({
  imageUrl = '/images/banner-mp2026.png',
  alt = 'Mistrzostwa Polski 2026',
  linkUrl
}: BannerProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Placeholder when image is not available
    return (
      <div className="w-full bg-gradient-to-r from-darts-primary to-darts-primary-hover text-white py-4 px-3 sm:px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-lg sm:text-xl font-bold">
            Mistrzostwa Polski w Darcie 2026
          </h2>
          <p className="text-sm opacity-90 mt-1">
            Wkrótce więcej informacji
          </p>
        </div>
      </div>
    );
  }

  const content = (
    <div className="relative w-full aspect-[3/1] sm:aspect-[4/1]">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
        priority
      />
    </div>
  );

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-95 transition-opacity"
      >
        {content}
      </a>
    );
  }

  return content;
}
