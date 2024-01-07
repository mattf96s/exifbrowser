import { getCloserAngle } from "advanced-cropper";
import { useRef, useState } from "react";
import type { CropperProps, CropperRef } from "react-advanced-cropper";
import { Cropper, isEqualState } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { cn } from "~/lib/utils";
import { Toolbar } from "./toolbar";

export interface DefaultCropperProps extends CropperProps {
  wrapperClassName?: string;
}

export type DefaultCropperMethods = CropperRef;

export const DefaultCropper = ({
  wrapperClassName,
  className,
  ...props
}: DefaultCropperProps) => {
  const [changed, setChanged] = useState(false);

  const cropperRef = useRef<CropperRef>(null);

  const getDefaultState = () => {
    const currentState = cropperRef.current?.getState();
    const defaultState = cropperRef.current?.getDefaultState();
    return currentState && defaultState
      ? {
          ...defaultState,
          transforms: {
            ...defaultState.transforms,

            rotate: getCloserAngle(
              currentState.transforms.rotate,
              defaultState.transforms.rotate
            ),
          },
        }
      : null;
  };

  const onRotate = (angle: number) => {
    cropperRef.current?.rotateImage(angle);
  };

  const onFlip = (horizontal: boolean, vertical: boolean) => {
    cropperRef.current?.flipImage(horizontal, vertical);
  };

  const onReset = () => {
    cropperRef.current?.setState(getDefaultState());
  };
  const onChange = (cropper: CropperRef) => {
    setChanged(!isEqualState(cropper.getState(), getDefaultState()));
  };

  const onZoomIn = () => {
    cropperRef.current?.zoomImage(0.1);
  };

  return (
    <div
      className={cn(
        "default-cropper flex flex-col h-full bg-black",
        wrapperClassName
      )}
    >
      <Cropper
        onChange={onChange}
        className={cn("default-cropper__cropper min-h-0 h-full", className)}
        ref={cropperRef}
        {...props}
      />
      <div className="bg-[#080808] border-t border-[#171616] h-[64px] shrink-0 mt-auto">
        <Toolbar
          changed={changed}
          onReset={onReset}
          onFlip={onFlip}
          onRotate={onRotate}
        />
      </div>
    </div>
  );
};

DefaultCropper.displayName = "DefaultCropper";
