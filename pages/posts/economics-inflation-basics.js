// pages/posts/economics-inflation-basics.js
export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/posts/economicInfo/inflation-basics",
      permanent: true, // 308/301 둘 중 하나로 처리됨 (정상)
    },
  };
}

export default function Page() {
  return null;
}
