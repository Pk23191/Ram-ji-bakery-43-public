import Image from "next/image";
import { useEffect, useState } from "react";
import { getImageUrl, isInlineImage } from "../data/site";

export default function ProductImage({ src, alt, className = "", fill = false, ...props }) {
  const resolvedSrc = getImageUrl(src);
  const [hasError, setHasError] = useState(false);
  const sizes = props.sizes || "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw";
  const quality = props.quality ?? 75;

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  if (!resolvedSrc) {
    return null;
  }

  if (isInlineImage(resolvedSrc)) {
    if (fill) {
      return (
        <img
          src={resolvedSrc}
          alt={alt}
          loading={props.loading || "lazy"}
          className={`h-full w-full ${className}`.trim()}
          {...props}
        />
      );
    }

    return <img src={resolvedSrc} alt={alt} loading={props.loading || "lazy"} className={className} {...props} />;
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("Product image:", resolvedSrc);
  }

  if (hasError) {
    return <img src={resolvedSrc} alt={alt} className={className} {...props} />;
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      quality={quality}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
