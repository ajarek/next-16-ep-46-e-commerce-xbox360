import FeaturedDeals from "@/components/FeaturedDeals";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Hero />
      <FeaturedDeals />
    </div>
  );
}
