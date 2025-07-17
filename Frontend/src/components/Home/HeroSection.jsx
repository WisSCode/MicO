import React from 'react';
import { Link } from 'react-router-dom';
import { FaHamburger } from "react-icons/fa";

const HeroSection = () => {
  return (
    <section className="hero-section apple-hero">
      <div className="hero-content" style={{alignItems:'center',textAlign:'center',justifyContent:'center',display:'flex',flexDirection:'column',padding:'2.5rem 0'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
          <span className="logo-text" style={{fontSize:'3rem',fontWeight:800}}>Mic</span>
          <span className="burger-icon" style={{fontSize:'3.2rem'}}><FaHamburger size={54} /></span>
        </div>
        <p style={{fontSize:'1.35rem',color:'var(--gray-600)',margin:'1.2rem 0 2.2rem 0',fontWeight:500}}>Tu comida favorita, a un clic. Simple. Rápido. Apple style.</p>
        <div className="hero-actions" style={{justifyContent:'center'}}>
          <Link to="/order" className="btn-primary" style={{fontSize:'1.15rem',padding:'0.9rem 2.2rem',borderRadius:18}}>Ordenar ahora</Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;