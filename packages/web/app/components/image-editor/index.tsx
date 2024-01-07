import { GearIcon as SettingsIcon } from "@radix-ui/react-icons";
import { preventZoom } from "advanced-cropper/extensions/prevent-zoom";
import type { FC } from "react";
import React, { useRef, useState } from "react";
import {
  CircleStencil,
  ImageRestriction,
  Priority,
  RectangleStencil,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { cn } from "~/lib/utils";
import { DefaultCropper } from "./components/cropper";
import logo from "/logo.png";

interface Image {
  src: string;
  preview: string;
}

export interface CropperSettings {
  aspectRatio?: number;
  minAspectRatio?: number;
  maxAspectRatio?: number;
  imageRestriction?: ImageRestriction;
  stencilType?: "rectangle" | "circle";
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  scaleImage?: boolean;
  grid?: boolean;
}

export interface CropperDescription {
  key: string;
  info: {
    name: string;
    description: string;
  };
  link?: string;
  features: string[];
  settings: string[];
}

export const CroppersWizard: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<CropperSettings>({
    aspectRatio: undefined,
    minAspectRatio: undefined,
    maxAspectRatio: undefined,
    imageRestriction: ImageRestriction.none,
    stencilType: "rectangle",
    minWidth: 0,
    maxWidth: undefined,
    minHeight: 0,
    maxHeight: undefined,
    scaleImage: true,
    grid: true,
  });

  const images: Image[] = [
    {
      src: logo,
      preview: logo,
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1669447357952-aa3a1bc56540?q=80&w=1967&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      preview:
        "https://plus.unsplash.com/premium_photo-1669447357952-aa3a1bc56540?q=80&w=1967&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  const [cropper, setCropper] = useState("default-cropper");

  const [src, setSrc] = useState("");

  const [customImage, setCustomImage] = useState(false);

  const loadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reference to the DOM input element
    const { files } = event.target;
    // Ensure that you have a file before attempting to read it
    if (files && files[0]) {
      // 1. Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
      if (src && customImage) {
        URL.revokeObjectURL(src);
      }
      const blob = URL.createObjectURL(files[0]);

      setSrc(blob);
      setCustomImage(true);
    }
  };

  const onImageClick = (image: Image) => () => {
    setSrc(image.src);
    setCustomImage(false);
  };

  const onCropperClick = (cropper: CropperDescription) => () => {
    setCropper(cropper.key);
  };

  const onFileLoadClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const [showSettings, setShowSettings] = useState(false);

  const onOpenSettings = () => {
    setShowSettings(true);
  };

  const onCloseSettings = (values: CropperSettings) => {
    setSettings(values);
    setShowSettings(false);
  };

  const {
    minHeight,
    minWidth,
    maxWidth,
    maxHeight,
    aspectRatio,
    maxAspectRatio,
    minAspectRatio,
    imageRestriction,
    stencilType,
    scaleImage,
    grid,
  } = settings;

  const stencilProps = {
    aspectRatio,
    maxAspectRatio,
    minAspectRatio,
    grid,
  };

  return (
    <div className={"flex min-w-0"}>
      <div className="shadow-[0_0_18px_0_rgba(2_3_3_0.48)] relative bg-black max-w-[calc(100%-40px)] mx-5 w-[540px] h-[550px] overflow-hidden rounded-md max-h-[calc(100vh-40px)]">
        {typeof window !== "undefined" && cropper === "default-cropper" && (
          <DefaultCropper
            key={"default-cropper"}
            minHeight={minHeight}
            minWidth={minWidth}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            priority={
              imageRestriction === ImageRestriction.fillArea
                ? Priority.visibleArea
                : Priority.coordinates
            }
            wrapperClassName={"croppers-wizard__cropper h-full"}
            src={src}
            stencilProps={stencilProps}
            stencilComponent={
              stencilType === "circle" ? CircleStencil : RectangleStencil
            }
            transformImage={{
              adjustStencil:
                imageRestriction !== "stencil" && imageRestriction !== "none",
            }}
            postProcess={!scaleImage ? preventZoom : undefined}
            backgroundWrapperProps={{
              scaleImage,
            }}
            imageRestriction={imageRestriction}
          />
        )}

        <button
          className="croppers-wizard__settings-button"
          onClick={onOpenSettings}
        >
          <SettingsIcon />
        </button>

        {/* <CroppersWizardSettings
          open={showSettings}
          settings={settings}
          onClose={onCloseSettings}
          properties={data.settings}
          className={"croppers-wizard__settings"}
          visibleClassName={"croppers-wizard__settings--visible"}
        /> */}
      </div>
      <div className="croppers-wizard__column croppers-wizard__column--right">
        <div className="croppers-wizard__column-title">Image</div>
        {images.map((image) => (
          <div
            key={image.src}
            onClick={onImageClick(image)}
            className={cn(
              "mb-5 w-[40px] size-[40px] rounded-sm bg-[#2d2c2c] cursor-pointer bg-cover bg-center bg-no-repeat opacity-70 transition-opacity duration-500",
              image.src === src && "opacity-100"
            )}
            style={{
              backgroundImage: `url(${image.preview})`,
            }}
          />
        ))}
        <div
          onClick={onFileLoadClick}
          className={cn(
            "mb-5 w-[40px] size-[40px] rounded-sm bg-[#2d2c2c] cursor-pointer flex items-center justify-center fill-[##6E6D6E]/80 transition-opacity duration-500"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15.5">
            <path d="M8.6 6.7H15v2.2H8.6v6.7H6.4V8.8H0V6.7h6.4V0h2.2v6.7z" />
          </svg>
          <input
            className="croppers-wizard__file-input"
            type="file"
            ref={inputRef}
            onChange={loadImage}
          />
        </div>
      </div>
    </div>
  );
};
