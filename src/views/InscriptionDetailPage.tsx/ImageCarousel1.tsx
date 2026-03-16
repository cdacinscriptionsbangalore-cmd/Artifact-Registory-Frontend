import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "./ImageCarousel1.css";
import AppImage from "@/components/AppImage";

interface ImageCarouselProps {
    images: string[];
    alt?: string;
    className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
    images = [],
    alt = "",
    className = "w-full h-64 sm:h-80 md:h-96",
}) => {
    const safeImages = images.length > 0 ? images : [""];

    const galleryItems = safeImages.map((image) => ({
        original: image,
        thumbnail: image,
        description: alt,
    }));

    const renderItem = (item: any) => (
        <div className={className}>
            <AppImage
                src={item.original}
                alt={item.description || alt || "Inscription image"}
                className="w-full h-full object-cover"
            />
        </div>
    );

    const renderThumbInner = (item: any) => (
        <AppImage
            src={item.thumbnail}
            alt={item.description || alt || "Inscription thumbnail"}
            className="image-gallery-thumbnail-image object-cover"
        />
    );

    return (
        <div className="mb-5">
            <ImageGallery
                items={galleryItems}
                renderItem={renderItem}
                renderThumbInner={renderThumbInner}
                showThumbnails={true}
                showFullscreenButton={true}
                showPlayButton={false}
                showBullets={true}
                useBrowserFullscreen={true}
                // thumbnailPosition={"left"}
                // showPlayButton={true}
            />
        </div>
    );
};

export default ImageCarousel;
