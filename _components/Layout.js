// _components/Layout.js
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {/* 메인 컨테이너: 데스크톱/모바일 공통 여백 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <Footer />
    </>
  );
}
