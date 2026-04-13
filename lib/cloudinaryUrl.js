// lib/cloudinaryUrl.js
export function cloudinaryThumb(url, { w = 640, h = 360 } = {}) {
  if (!url) return url;
  const s = String(url);

  if (!s.includes("res.cloudinary.com") || !s.includes("/upload/")) {
    return s;
  }

  return s.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_fill,w_${w},h_${h}/`
  );
}

export function cloudinaryContain(url, { w = 640, h = 360 } = {}) {
  if (!url) return url;
  const s = String(url);

  if (!s.includes("res.cloudinary.com") || !s.includes("/upload/")) {
    return s;
  }

  return s.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_fit,w_${w},h_${h}/`
  );
}