import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main style={{maxWidth:960, margin:'0 auto', padding:'16px'}}>
        {children}
      </main>
      <Footer />
    </>
  );
}
