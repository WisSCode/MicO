import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { FaBars, FaMapMarkerAlt, FaHamburger, FaShoppingCart } from 'react-icons/fa';
import './Header.css';

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      } catch (error) {
        console.error('Error updating cart count:', error);
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    
    // Listen for custom event when cart is updated
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleMenuClick = () => {
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  return (
    <header className="ue-header">
      <div className="ue-header-content">
        <div className="ue-header-left">
          <button 
            className="ue-hamburger-btn"
            aria-label="Menú"
            onClick={handleMenuClick}
            // sin animación ni escala
          >
            <FaBars size={24} />
          </button>
          <Link to="/" className="ue-logo-area">
            <span className="ue-logo-text">
              Mic <span className="ue-burger-icon"><FaHamburger /></span>
            </span>
          </Link>
        </div>
        <div className="ue-header-center">
          <div className="ue-address-input">
            <FaMapMarkerAlt style={{marginRight:6}} />
            <span>Ingresa la dirección de entrega</span>
            <span className="ue-address-caret">▼</span>
          </div>
        </div>
        <div className="ue-header-right">
          <button 
            className="ue-cart-btn" 
            onClick={handleCartClick}
            style={{
              background: 'none',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              padding: '0.5rem',
              marginRight: '1rem',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <FaShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#e74c3c',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </button>
          {user ? (
            <>
              <span className="ue-user-name">{user.username || user.name}</span>
              <button className="ue-logout-btn" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" className="ue-login-btn">Iniciar sesión</Link>
              <Link to="/register" className="ue-register-btn">Regístrate</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 