import SeoHead from '../_components/SeoHead';
import { useRouter } from 'next/router';

export default function Contact() {
  const { locale } = useRouter();
  const isEn = locale === 'en';

  return (
    <>
      <SeoHead
        title="Contact"
        desc={isEn ? 'Contact FinMap' : '문의'}
        url="/contact"
        locale={locale}
      />

      <h1>Contact</h1>

      {isEn ? (
        <p>Email: contact@finmaphub.com</p>
      ) : (
        <p>문의: contact@finmaphub.com</p>
      )}
    </>
  );
}
