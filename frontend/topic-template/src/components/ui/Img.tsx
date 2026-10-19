import { useState, type ImgHTMLAttributes } from 'react';
import type { MediaAsset } from '../../content/media';

type ImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height' | 'alt'> & {
  media: MediaAsset;
  /** Use empty string for decorative images. */
  alt: string;
  /** LCP images: eager, high fetch priority, never lazy. */
  priority?: boolean;
};

/** Image with reserved dimensions, sensible loading defaults, and a real-photo fallback. */
export function Img({ media, alt, priority = false, loading, sizes, onError, ...rest }: ImgProps) {
  const [failed, setFailed] = useState(false);
  const useFallback = failed && Boolean(media.fallbackSrc);
  const src = useFallback ? (media.fallbackSrc as string) : media.src;

  return (
    <img
      src={src}
      srcSet={useFallback ? undefined : media.srcSet}
      sizes={media.srcSet && !useFallback ? sizes : undefined}
      alt={alt}
      width={media.width}
      height={media.height}
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      onError={(event) => {
        if (!failed && media.fallbackSrc) setFailed(true);
        onError?.(event);
      }}
      {...rest}
    />
  );
}
