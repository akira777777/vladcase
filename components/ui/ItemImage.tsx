'use client';
import { useState, useRef, useEffect, type ImgHTMLAttributes } from 'react';
import legacyImages from '@/data/legacyImages.json';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> & {
  src: string;
  alt: string;
};
export default function ItemImage({
  src,
  alt,
  width = 200,
  height = 150,
  loading = 'lazy',
  ...props
}: Props) {
  src = (legacyImages as Record<string, string>)[src] ?? src;
  const [failed, setFailed] = useState<string | null>(null);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A failed SSR image may finish before React attaches its error handler.
    if (image.current?.complete && image.current.naturalWidth === 0)
      setFailed(src);
  }, [src]);
  if (failed === src)
    return (
      <span
        role="img"
        aria-label={alt}
        className={`inline-flex items-center justify-center text-xs text-text-secondary ${props.className ?? ''}`}
        style={{ width, height, maxWidth: '100%' }}
      >
        {alt}
      </span>
    );
  // Local WebP assets are precompressed; no runtime image proxy is needed.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={image}
      {...props}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onError={() => setFailed(src)}
    />
  );
}
