import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import RestaurantGrid from '../components/Home/RestaurantGrid';
import CategoryFilter from '../components/Home/CategoryFilter';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <div className="container">
        <CategoryFilter />
        <RestaurantGrid />
      </div>
    </div>
  );
};

export default HomePage;

