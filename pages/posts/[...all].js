// pages/posts/[...all].js
export async function getServerSideProps({ params }) {
  const all = params?.all || [];
  // 기대 형태: [category, lang, slug]
  if (all.length === 3) {
    const [category, lang, slug] = all;

    if (lang === "en") {
      return {
        redirect: {
          destination: `/en/posts/${category}/${slug}`,
          permanent: true,
        },
      };
    }
    if (lang === "ko") {
      return {
        redirect: {
          destination: `/posts/${category}/${slug}`,
          permanent: true,
        },
      };
    }
  }

  // 그 외 이상한 경로는 404 처리
  return { notFound: true };
}

export default function PostsCatchAll() {
  return null;
}
