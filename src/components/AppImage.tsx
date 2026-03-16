import React, { useEffect, useState } from "react";
import brokenImage from "@/assets/brokenImage.png";

interface AppImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

const normalizeSrc = (src?: string | null) =>
  typeof src === "string" && src.trim() ? src : "";

const AppImage: React.FC<AppImageProps> = ({
  src,
  fallbackSrc = brokenImage,
  onError,
  ...rest
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(normalizeSrc(src) || fallbackSrc);

  useEffect(() => {
    setResolvedSrc(normalizeSrc(src) || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (resolvedSrc !== fallbackSrc) {
      setResolvedSrc(fallbackSrc);
    }
    onError?.(event);
  };

  return <img {...rest} src={resolvedSrc} onError={handleError} />;
};

export default AppImage;
