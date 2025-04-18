import { IUploadImageToCloudinary } from '../utils/interfaces/services.interface';

export const uploadImageToCloudinary: IUploadImageToCloudinary = async (
  file,
  url,
  preset
) => {
  if (!file) throw new Error('No file provided');
  if (!preset) throw new Error('No upload preset provided');
  if (!url) throw new Error('No Cloudinary URL provided');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  try {
    const result = await fetch(url, {
      method: 'POST',
      body: formData, // Utilisez FormData au lieu de JSON
      // Ne pas définir 'content-type' : FormData le génère automatiquement avec le boundary
    });

    if (!result.ok) {
      const errorData = await result.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const imageData = await result.json();
    return imageData.secure_url;
  } catch (e) {
    throw new Error(`Error uploading image to Cloudinary: ${e.message}`);
  }
};