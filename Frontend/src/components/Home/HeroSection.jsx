import React from 'react';
import { Link } from 'react-router-dom';
import { FaHamburger } from "react-icons/fa";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>
          Descubre los sabores de <span className="logo-text">MIC<span className="burger-icon"><FaHamburger /></span></span>
        </h1>
        <p>Comida rápida, gourmet y más. Todo a un clic de distancia.</p>
        <div className="hero-actions">
          <Link to="/order" className="btn-primary">Ordenar ahora</Link>
          <Link to="/order-history" className="btn-outline">Historial</Link>
        </div>
      </div>
      <div className="hero-image" />
    </section>
  );
};

export default HeroSection;