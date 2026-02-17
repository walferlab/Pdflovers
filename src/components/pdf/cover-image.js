"use client";

import Image from "next/image";
import { useState } from "react";

export function CoverImage({ src, alt, sizes }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <Image
      className={`pdf-cover-image${isLoaded ? " is-loaded" : ""}`}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
}
