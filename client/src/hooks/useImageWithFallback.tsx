import { useEffect, useState } from "react";

type UseImageWithFallbackProps = {
  src: string | null;
  FallbackComponent: React.ComponentType;
  className?: string;
  alt?: string;
};

export const useImageWithFallback = ({ 
    src, 
    FallbackComponent, 
    className = "", 
    alt = "image" 
}: UseImageWithFallbackProps) => {
    const [imageSrc, setImageSrc] = useState<string | null>(src);

    useEffect(() => {
        setImageSrc(src);
    }, [src]);

    if (!imageSrc) {
        return <FallbackComponent />;
    }

    return (
        <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={() => setImageSrc(null)}
        />
    );
};