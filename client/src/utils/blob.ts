export const blobToBase64 = (blob: Blob): Promise<string>  => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string); // dataURL
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const getImageBlob = async (imagePath: string): Promise<Blob> => {
  const response = await fetch(imagePath);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}