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

function cloudinaryTransform(url, transformation) {
  if (!url) return url;
  const s = String(url);

  if (!s.includes("res.cloudinary.com") || !s.includes("/upload/")) {
    return s;
  }

  const [prefix, suffix] = s.split("/upload/");
  const parts = suffix.split("/");

  if (parts.length > 1 && parts[0].includes(",") && !/^v\d+$/.test(parts[0])) {
    parts.shift();
  }

  return `${prefix}/upload/${transformation}/${parts.join("/")}`;
}

export function cloudinaryFillLoader({ aspectW = 16, aspectH = 9 } = {}) {
  return ({ src, width }) => {
    const w = Math.max(1, Math.round(Number(width) || 640));
    const h = Math.max(1, Math.round((w * aspectH) / aspectW));
    return cloudinaryTransform(src, `f_auto,q_auto,c_fill,w_${w},h_${h}`);
  };
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

export function cloudinaryContentImage(url, { w = 1200 } = {}) {
  if (!url) return url;
  const s = String(url);

  if (!s.includes("res.cloudinary.com") || !s.includes("/upload/")) {
    return s;
  }

  return s.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_limit,w_${w}/`
  );
}
