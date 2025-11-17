// _components/Layout.js
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />

      {/* ✅ 모든 페이지 공통 래퍼: 어떤 기기든 똑같이 동작 */}
      <main className="w-full px-4 py-6">
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      <Footer />
    </>
  );
}
