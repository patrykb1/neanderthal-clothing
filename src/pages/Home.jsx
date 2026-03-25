import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import BrandStatement from '../components/home/BrandStatement';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <BrandStatement />
    </div>
  );
}