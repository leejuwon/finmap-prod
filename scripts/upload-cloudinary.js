// scripts/upload-cloudinary.js (CommonJS 버전)
const fs = require('fs');
const path = require('path');
const { uploadImage } = require('../lib/cloudinary');

// 업로드할 로컬 폴더 (예: /images-to-upload)
const LOCAL_DIR = path.join(__dirname, '..', 'images-to-upload');

// Cloudinary 안에서 폴더 구조 (예: blog/cagr)
const CLOUDINARY_FOLDER = 'blog/personalFinance';

async function run() {
  if (!fs.existsSync(LOCAL_DIR)) {
    console.error(`❌ 폴더가 없습니다: ${LOCAL_DIR}`);
    console.error('이미지 파일들을 넣을 "images-to-upload" 폴더를 만들어 주세요.');
    process.exit(1);
  }

  const files = fs.readdirSync(LOCAL_DIR);

  if (files.length === 0) {
    console.log(`⚠️ 업로드할 파일이 없습니다. (${LOCAL_DIR})`);
    return;
  }

  for (const file of files) {
    const fullPath = path.join(LOCAL_DIR, file);

    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    console.log(`Uploading: ${file} ...`);

    try {
      const result = await uploadImage(fullPath, {
        folder: CLOUDINARY_FOLDER,
      });

      console.log(`✅ ${file} → ${result.secure_url}`);
    } catch (err) {
      console.error(`❌ 업로드 실패: ${file}`);
      console.error(err.message || err);
    }
  }

  console.log('=== Done ===');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
