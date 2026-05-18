// _components/Layout.js
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />

      {/* ✅ 모든 페이지 공통 래퍼: 어떤 기기든 똑같이 동작 */}
      <main className="w-full max-w-full min-w-0 px-3 sm:px-4 py-4 md:py-6">
        {/* Fixed bottom toolbars can opt into .fm-safe-bottom; keep layout neutral by default. */}
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto min-w-0">
          {children}
        </div>
      </main>

      <Footer />
    </>
  );
}
