// lib/cloudinary.js (CommonJS + dotenv)
const path = require('path');
const dotenv = require('dotenv');

// .env.local 또는 .env 중에서 네가 실제로 사용 중인 파일 경로
// .env.local을 쓰고 있다면:
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
// 만약 .env에 넣었다면 위 줄 대신:
// dotenv.config({ path: path.join(__dirname, '..', '.env') });

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 단일 이미지 업로드
 */
async function uploadImage(localPath, options = {}) {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: 'finmap',
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    ...options,
  });

  return result;
}

async function uploadImageFromBase64(dataUrl, options = {}) {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: 'finmap',
    ...options,
  });
  return result;
}

module.exports = {
  cloudinary,
  uploadImage,
  uploadImageFromBase64,
};
