import FeaturedProducts from "../components/FeaturedProducts";
import HeroSection from "../components/HeroSection";
import InstagramGallery from "../components/InstagramGallery";
import RecommendationStrip from "../components/RecommendationStrip";
import Seo from "../components/Seo";
import TestimonialSection from "../components/TestimonialSection";

export default function HomePage() {
  return (
    <>
      <Seo
        title="Freshly Baked Happiness Everyday"
        description="Order premium cakes, pastries, breads and birthday essentials from Ramji Bakery in Dinara, Madhya Pradesh."
        path="/"
      />
      <HeroSection />
      <FeaturedProducts />
      <RecommendationStrip />
      <TestimonialSection />
      <InstagramGallery />
    </>
  );
}
