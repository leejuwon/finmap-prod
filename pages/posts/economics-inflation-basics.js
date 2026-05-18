// pages/posts/economics-inflation-basics.js
export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/posts/economicInfo/inflation-basics",
      statusCode: 301,
    },
  };
}

export default function Page() {
  return null;
}
