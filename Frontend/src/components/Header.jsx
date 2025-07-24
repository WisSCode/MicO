import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import { FaBars, FaMapMarkerAlt, FaHamburger, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';
import './Header.css';

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useUser();
  const { empresaNombre } = useParams();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const fetchCartCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/cart/my-cart/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const items = res.data.items || [];
        const count = items.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      } catch (error) {
        setCartCount(0);
      }
    };

    fetchCartCount();
    // Solo actualiza cuando se dispara el evento personalizado
    const handleCartUpdated = async () => {
      // Esperar un pequeño tiempo para asegurar que el backend ya limpió el carrito
      setTimeout(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          setCartCount(0);
          return;
        }
        try {
          const res = await axios.get(`${API_BASE}/cart/my-cart/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const items = res.data.items || [];
          const count = items.reduce((total, item) => total + item.quantity, 0);
          setCartCount(count);
        } catch (error) {
          setCartCount(0);
        }
      }, 200); // 200ms de espera
    };
    window.addEventListener('cartUpdated', handleCartUpdated);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
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
          {user ? (
            user.role === 'empresa' ? (
              <Link to={`/${user.empresaNombre || empresaNombre}/home`} className="ue-logo-area">
                <span className="ue-logo-text">
                  Mic <span className="ue-burger-icon"><FaHamburger /></span>
                </span>
              </Link>
            ) : user.role === 'cliente' ? (
              <Link to="/" className="ue-logo-area">
                <span className="ue-logo-text">
                  Mic <span className="ue-burger-icon"><FaHamburger /></span>
                </span>
              </Link>
            ) : user.role === 'repartidor' ? (
              <Link to="/repartidor/home" className="ue-logo-area">
                <span className="ue-logo-text">
                  Mic <span className="ue-burger-icon"><FaHamburger /></span>
                </span>
              </Link>
            ) : (
              <Link to="/" className="ue-logo-area">
                <span className="ue-logo-text">
                  Mic <span className="ue-burger-icon"><FaHamburger /></span>
                </span>
              </Link>
            )
          ) : (
            <Link to="/" className="ue-logo-area">
              <span className="ue-logo-text">
                Mic <span className="ue-burger-icon"><FaHamburger /></span>
              </span>
            </Link>
          )}
        </div>
        <div className="ue-header-center">
          {user && user.role === 'usuarionormal' && (
            <div className="ue-address-input">
              <FaMapMarkerAlt style={{marginRight:6}} />
              <span>Ingresa la dirección de entrega</span>
              <span className="ue-address-caret">▼</span>
            </div>
          )}
        </div>
        <div className="ue-header-right">
          {user ? (
            <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
              {user.role === 'empresa' && (
                <nav className="empresa-navbar" style={{display:'flex',gap:'1rem',alignItems:'center',marginRight:'1.5rem',background:'none'}}>
                  <Link to={`/${user.empresaNombre || empresaNombre}/home`} className="empresa-navbar-link" style={{background:'#f3f4f6',borderRadius:'999px',padding:'0.5rem 1.2rem',color:'#ff8000',fontWeight:'500',textDecoration:'none',fontSize:'1rem',display:'flex',alignItems:'center',height:'40px'}}>
                    Inicio
                  </Link>
                  <Link to={`/${user.empresaNombre || empresaNombre}/productos`} className="empresa-navbar-link" style={{background:'#f3f4f6',borderRadius:'999px',padding:'0.5rem 1.2rem',color:'#ff8000',fontWeight:'500',textDecoration:'none',fontSize:'1rem',display:'flex',alignItems:'center',height:'40px'}}>
                    Productos
                  </Link>
                  <Link to={`/${user.empresaNombre || empresaNombre}/config`} className="empresa-navbar-link" style={{background:'#f3f4f6',borderRadius:'999px',padding:'0.5rem 1.2rem',color:'#ff8000',fontWeight:'500',textDecoration:'none',fontSize:'1rem',display:'flex',alignItems:'center',height:'40px'}}>
                    Configuración
                  </Link>
                </nav>
              )}
              <button className="ue-cart-btn" 
                onClick={handleCartClick}
                style={{
                  background: 'none',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  marginRight: '1.5rem',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s',
                  display:'flex',alignItems:'center',height:'40px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    left: '-5px',
                    background: '#e74c3c',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
              <span className="ue-user-name" style={{background:'#f3f4f6',borderRadius:'999px',padding:'0.5rem 1.2rem',color:'#222',fontWeight:'500',marginRight:'1.5rem',display:'flex',alignItems:'center',height:'40px',whiteSpace:'nowrap'}}>{user.username || user.name}</span>
              <button className="ue-logout-btn" onClick={handleLogout} style={{height:'40px',display:'flex',alignItems:'center'}}>Salir</button>
            </div>
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