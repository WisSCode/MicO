import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import EmpresaNavbar from './EmpresaNavbar';

const StickyEmpresaNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <>
      <EmpresaNavbar />
      {scrolled && (
        <div className="empresa-navbar-sticky">
          <EmpresaNavbar />
        </div>
      )}
    </>
  );
};

export default StickyEmpresaNavbar;
