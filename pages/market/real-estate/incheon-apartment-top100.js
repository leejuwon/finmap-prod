import RealEstateSeoLanding from "../../../_components/RealEstateSeoLanding";
import { realEstateSeoLandingPages } from "../../../lib/realEstateSeoLandingPages";

export default function IncheonApartmentTop100Landing() {
  return <RealEstateSeoLanding page={realEstateSeoLandingPages.incheon} />;
}

export async function getStaticProps({ locale }) {
  if (locale === "en") return { notFound: true };
  return { props: {} };
}
