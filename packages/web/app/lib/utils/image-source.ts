// // https://github.com/imgly/background-removal-js/blob/main/packages/web/src/utils.ts
// type ImageSource = ImageData | ArrayBuffer | Uint8Array | Blob | URL | string;

// async function imageSourceToImageData(
//   image: ImageSource,
 
// ): Promise<NdArray<Uint8Array>> {
//   if (typeof image === 'string') {
    
//     image = new URL(image);
//   }
//   if (image instanceof URL) {
//     const response = await fetch(image, {});
//     image = await response.blob();
//   }
//   if (image instanceof ArrayBuffer || ArrayBuffer.isView(image)) {
//     image = new Blob([image]);
//   }
//   if (image instanceof Blob) {
//     image = await imageDecode(image);
//   }

//   return image as NdArray<Uint8Array>;
// }