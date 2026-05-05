"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { BlurPlaceholder } from "./BlurPlaceholder";

interface ImageWithFallbackProps extends ImageProps {
  blurHash?: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  blurHash,
  fallbackSrc = "/placeholder-artifact.jpg",
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (  
    <div className="relative w-full h-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      {!isLoaded && blurHash && (
        <BlurPlaceholder hash={blurHash} />
      )}

      <Image
        {...props}
        src={error ? fallbackSrc : src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${props.className}`}
      />
    </div>
  );
}