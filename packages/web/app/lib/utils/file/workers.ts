// https://github.com/stophecom/sharrr-svelte/blob/0a4ad8ad0d9cc97b9f5978a4b0019f3ba4ed4185/src/lib/utils.ts#L14C1-L30C2
export const sendMessageToServiceWorker = <T>(
  msg: Record<string, unknown>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event) => {
      if (event.data === undefined) {
        reject("bad response from serviceWorker");
      } else if (event.data.error !== undefined) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    navigator?.serviceWorker?.controller?.postMessage(msg, [channel.port2]);
  });
};
