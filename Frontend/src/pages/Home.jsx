import { useState, useEffect } from 'react';

import axios from 'axios';
import { motion } from 'framer-motion';

const Home = () => {
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular llamada a la API
    const fetchData = async () => {
      try {
        // En un proyecto real, aquí harías una llamada a tu backend Django
        const mockRestaurants = [
          {
            id: 1,
            name: "Burger King",
            rating: 4.5,
            deliveryTime: "20-30 min",
            image: "https://source.unsplash.com/random/300x200/?burger"
          },
          {
            id: 2,
            name: "Pizza Hut",
            rating: 4.2,
            deliveryTime: "25-35 min",
            image: "https://source.unsplash.com/random/300x200/?pizza"
          },
          // Más restaurantes...
        ];

       

       
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="home-page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section className="categories-section">
          <h2>Categorías</h2>
          <div className="categories-grid">
            
          </div>
        </section>

        <section className="restaurants-section">
          <h2>Restaurantes cerca de ti</h2>
          <div className="restaurants-grid">
            
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Home;