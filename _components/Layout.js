// _components/Layout.js
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {/* ✅ 전체 페이지 공통 레이아웃: 폭 제한 없이 예전처럼 container 만 사용 */}
      <main className="container max-w-5xl w-full px-4 py-6 mx-auto fm-mobile-full">
        {children}
      </main>
      <Footer />
    </>
  );
}
