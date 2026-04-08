import { uploadImage } from '../utils/uploadImage.js';

export const uploadImageHandler = async (req, res) => {
  try {
    if (!req.files?.image) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const url = await uploadImage(req.files.image);
    if (!url) return res.status(500).json({ error: 'Upload failed' });
    res.json({ url });
  } catch (err) {
    console.error('uploadImageHandler error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
