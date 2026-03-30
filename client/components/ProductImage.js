import Image from "next/image";
import { getImageUrl, isInlineImage } from "../data/site";

export default function ProductImage({ src, alt, className = "", fill = false, ...props }) {
  const resolvedSrc = getImageUrl(src);

  if (!resolvedSrc) {
    return null;
  }

  if (isInlineImage(resolvedSrc)) {
    if (fill) {
      return <img src={resolvedSrc} alt={alt} className={`h-full w-full ${className}`.trim()} {...props} />;
    }

    return <img src={resolvedSrc} alt={alt} className={className} {...props} />;
  }

  return <Image src={resolvedSrc} alt={alt} className={className} fill={fill} {...props} />;
}
