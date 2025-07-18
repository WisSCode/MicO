import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import { FaListAlt, FaHistory, FaStore, FaGift, FaUserCircle, FaShoppingCart, FaCreditCard, FaHome } from 'react-icons/fa';
import '../styles/components/hamburgerMenu.css';

const HEADER_HEIGHT = 64; // px, debe coincidir con el header

const HamburgerMenu = ({ isOpen, onToggle }) => {
  const { user } = useUser();
  const location = useLocation();

  const handleClose = () => onToggle();
  const handleNav = () => onToggle();

  // Mock cupones
  const cupones = [
    { code: 'APPLE10', desc: '10% OFF en tu próxima compra' },
    { code: 'ENVIOGRATIS', desc: 'Envío gratis en pedidos $30+' },
    { code: '2X1BURGER', desc: '2x1 en Burger Palace' },
  ];

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Inicio' },
    { path: '/cart', icon: FaShoppingCart, label: 'Carrito' },
    { path: '/order', icon: FaListAlt, label: 'Estado del pedido' },
    { path: '/order-history', icon: FaHistory, label: 'Historial de pedidos' },
  ];

  return (
    <>
      <nav
        className={`sidebar apple-sidebar${isOpen ? ' open' : ''}`}
        style={{ top: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        <div className="sidebar-header">
          <div className="sidebar-avatar" style={{marginTop: '1.5rem'}}>
            <FaUserCircle size={64} style={{color: 'var(--primary-blue-dark)'}} />
            <span style={{fontWeight:700,fontSize:'1.15rem',marginTop:8}}>{user ? (user.username || user.name) : 'Invitado'}</span>
          </div>
        </div>
        <ul className="sidebar-list">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === '/company/1/products' && location.pathname.startsWith('/company'));
            
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  onClick={handleNav} 
                  className={isActive ? 'active' : ''}
                  style={{
                    animationDelay: `${menuItems.indexOf(item) * 0.1}s`
                  }}
                >
                  <IconComponent /> {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="sidebar-cupones">
          <h4><FaGift style={{marginRight:4}}/>Cupones</h4>
          {cupones.map((c, index) => (
            <div 
              className="cupon-card" 
              key={c.code}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <span className="cupon-code">{c.code}</span>
              <span className="cupon-desc">{c.desc}</span>
            </div>
          ))}
        </div>
      </nav>
      {isOpen && <div className="sidebar-backdrop apple-blur" onClick={handleClose}></div>}
    </>
  );
};

export default HamburgerMenu; 