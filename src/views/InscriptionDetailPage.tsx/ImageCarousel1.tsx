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
    className = "w-full h-[20rem] sm:h-[24rem] md:h-[30rem]",
}) => {
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const safeImages = images.length > 0 ? images : [""];

    const galleryItems = safeImages.map((image) => ({
        original: image,
        thumbnail: image,
        description: alt,
    }));

    const itemContainerClass = isFullscreen
        ? "m-1 w-screen h-[calc(100vh-12rem)] sm:h-[calc(100vh-7rem)]"
        : className;

    const renderItem = (item: any) => (
        <div className={itemContainerClass}>
            <AppImage
                src={item.original}
                alt={item.description || alt || "Inscription image"}
                className="w-full h-full object-contain"
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
        <div className="mb-5 border-1 rounded-lg overflow-hidden border-gray-300 p-1">
            <ImageGallery
                items={galleryItems}
                additionalClass="custom-image-gallery"
                renderItem={renderItem}
                renderThumbInner={renderThumbInner}
                showThumbnails={true}
                showFullscreenButton={true}
                showPlayButton={false}
                showBullets={true}
                useBrowserFullscreen={true}
                onScreenChange={(fullScreen) => setIsFullscreen(Boolean(fullScreen))}
                // thumbnailPosition={"left"}
                // showPlayButton={true}
            />
        </div>
    );
};

export default ImageCarousel;
