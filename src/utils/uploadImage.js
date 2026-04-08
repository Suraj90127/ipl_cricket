import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

export const uploadImage = async (file) => {
  try {
    const apiKey = process.env.IMGBB_API_KEY || 'dc118197051dba67790610051c113cd1';
    const form = new FormData();
    form.append('image', fs.createReadStream(file.tempFilePath), file.name);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, form, {
      headers: { ...form.getHeaders() },
    });

    return response.data?.data?.url ?? null;
  } catch (error) {
    console.error('Image upload failed:', error.response?.data || error.message);
    return null;
  }
};