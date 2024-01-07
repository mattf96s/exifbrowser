type IRotData = readonly [Uint8Array | null, number, number];

/**
 * Example of how to use OffscreenCanvas to convert an image URL to a buffer
 * https://github.com/sixem/imagerot/blob/main/typescript/imagerot/browser/urlToBuffer/index.ts
 */
const urlToBuffer = async (url: string): Promise<IRotData> => {
  const response = await fetch(url);
  const imageBlob = await response.blob();

  const imageBitmap = await createImageBitmap(imageBlob);

  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const context = canvas.getContext("2d");

  if (context) {
    context.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);
    const imageData = context.getImageData(
      0,
      0,
      imageBitmap.width,
      imageBitmap.height
    );

    return [
      new Uint8Array(imageData.data.buffer),
      imageBitmap.width,
      imageBitmap.height,
    ];
  }

  throw new Error("Failed to get context");
};

/**
 * https://github.com/sixem/imagerot/blob/main/typescript/imagerot/browser/fileToBuffer/index.ts
 * @param file
 * @returns
 */
const fileToBuffer = async (file: File): Promise<IRotData> => {
  return new Promise<IRotData>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const blob = new Blob([arrayBuffer]);

      const imageBitmap = await createImageBitmap(blob);

      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(
          imageBitmap,
          0,
          0,
          imageBitmap.width,
          imageBitmap.height
        );
        const imageData = context.getImageData(
          0,
          0,
          imageBitmap.width,
          imageBitmap.height
        );

        resolve([
          new Uint8Array(imageData.data.buffer),
          imageBitmap.width,
          imageBitmap.height,
        ]);
      } else {
        reject(new Error("Failed to get context"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

interface IRotItem {
  data: Uint8Array;
  width: number;
  height: number;
}

type TBufferToBlobHandler = (params: IRotItem) => Promise<string>;

/**
 * https://github.com/sixem/imagerot/blob/main/typescript/imagerot/browser/bufferToBlob/index.ts
 */
const bufferToBlob: TBufferToBlobHandler = async ({ data, width, height }) => {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");

  const clampedArray = new Uint8ClampedArray(data.buffer);
  const imageData = new ImageData(clampedArray, width, height);

  context?.putImageData(imageData, 0, 0);

  return canvas.convertToBlob().then((blob) => {
    if (blob) {
      return URL.createObjectURL(blob);
    } else {
      throw new Error("Failed to create Blob from canvas image");
    }
  });
};

// https://github.com/sixem/imagerot/blob/main/typescript/imagerot/browser/index.ts
// export const stage: TRotHandler = async ({ data, url }) => {
//   let [buffer, width, height]: IRotData = [null, 0, 0];

//   if(data) {
//       if(data instanceof File) {
//           [buffer, width, height] = await fileToBuffer(data) as IRotData;
//       } else if(Array.isArray(data) && data[0] instanceof Uint8Array) {
//           [buffer, width, height] = [...data];
//       } else if(typeof data === 'object') {
//           let preStaged = data as IRotItem;
//           if(preStaged.data instanceof Uint8Array && preStaged.width && preStaged.height) {
//               [buffer, width, height] = [preStaged.data, preStaged.width, preStaged.height];
//           }
//       }
//   } else if(url && typeof url === 'string') {
//       [buffer, width, height] = await urlToBuffer(url) as IRotData;
//   }

//   if(!buffer || !width || !height) {
//       throw new Error('Failed to load image data');
//   }

//   return { data: buffer, width, height };
// };
