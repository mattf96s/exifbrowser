import { useCallback, useEffect, useState } from "react";

// https://github.com/datadotworld/chart-builder/blob/main/src/util/util.je
export function useImage(
  file: Blob | MediaSource
): [HTMLImageElement, boolean, (width: number, height: number) => void] {
  const [image, setImage] = useState(new Image());
  const [isLoaded, setIsLoaded] = useState(false);

  const adjustResolution = useCallback(
    (width: number, height: number) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      const resizedImage = new Image();
      resizedImage.src = canvas.toDataURL();
      setImage(resizedImage);
    },
    [image]
  );

  useEffect(() => {
    const newImage = new Image();
    newImage.onload = () => {
      setIsLoaded(true);
    };
    newImage.src = URL.createObjectURL(file);
    setImage(newImage);

    return () => {
      newImage.onload = null;
    };
  }, [file]);

  return [image, isLoaded, adjustResolution];
}

function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mimeString });
}

// https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload
interface ResizeImageFileResult {
  file: File;
  resized: boolean;
  originalWidth?: number;
  originalHeight?: number;
}
export function resizeImageFile(
  file: File,
  maxSize: number
): Promise<ResizeImageFileResult> {
  const reader = new FileReader();
  const image = new Image();
  const canvas = document.createElement("canvas");

  const resize = (): ResizeImageFileResult => {
    let { width, height } = image;

    if (width > height) {
      if (width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      }
    } else if (height > maxSize) {
      width *= maxSize / height;
      height = maxSize;
    }

    if (width === image.width && height === image.height) {
      return { file, resized: false };
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("could not get context");
    }
    canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    const blob = dataURItoBlob(dataUrl);
    const f = new File([blob], file.name, {
      type: file.type,
    });
    return {
      file: f,
      resized: true,
      originalWidth: image.width,
      originalHeight: image.height,
    };
  };

  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      reject(new Error("Not an image"));
      return;
    }
    reader.onload = (readerEvent: any) => {
      image.onload = () => resolve(resize());
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}
