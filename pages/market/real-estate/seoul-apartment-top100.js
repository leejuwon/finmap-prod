import RealEstateSeoLanding from "../../../_components/RealEstateSeoLanding";
import { realEstateSeoLandingPages } from "../../../lib/realEstateSeoLandingPages";

export default function SeoulApartmentTop100Landing() {
  return <RealEstateSeoLanding page={realEstateSeoLandingPages.seoul} />;
}

export async function getStaticProps({ locale }) {
  if (locale === "en") return { notFound: true };
  return { props: {} };
}
