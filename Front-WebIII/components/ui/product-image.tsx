'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function ProductImage({
  src,
  alt,
  className = '',
  fallbackClassName = ''
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className} ${fallbackClassName}`}
      >
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  const fullImageUrl = src.startsWith('http')
    ? src
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}${src}`;

  console.log('🖼️ ProductImage URL:', { src, fullImageUrl });

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600" />
        </div>
      )}
      <Image
        src={fullImageUrl}
        alt={alt}
        fill
        className={`object-cover object-center transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

interface ProductImagesProps {
  images: Array<{ url: string } | string>;
  alt: string;
  className?: string;
  showAll?: boolean;
  maxVisible?: number;
}

export function ProductImages({
  images,
  alt,
  className = '',
  showAll = false,
  maxVisible = 1
}: ProductImagesProps) {
  // Asegurar que images sea un array
  const imagesArray = Array.isArray(images) ? images : [];
  
  // Debug: verificar qué se está pasando al componente
  console.log('🖼️ ProductImages recibido:', { 
    images, 
    imagesArray, 
    alt, 
    isArray: Array.isArray(images),
    length: imagesArray.length 
  });
  
  if (!imagesArray || imagesArray.length === 0) {
    console.log('🖼️ No hay imágenes, mostrando placeholder');
    return <ProductImage src="" alt={alt} className={className} />;
  }

  const displayImages = showAll ? imagesArray : imagesArray.slice(0, maxVisible);
  const remainingCount = imagesArray.length - maxVisible;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {displayImages.map((image, index) => {
        const imageUrl = typeof image === 'string' ? image : image.url;
        return (
          <ProductImage
            key={index}
            src={imageUrl}
            alt={`${alt} ${index + 1}`}
            className={index > 0 ? 'absolute inset-0' : 'w-full h-full'}
          />
        );
      })}

      {!showAll && remainingCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-medium">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
