import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FaHome, FaBoxOpen, FaCog } from 'react-icons/fa';
import '../styles/navbar-empresa.css';
import LogoutButton from './LogoutButton';

const EmpresaNavbar = () => {
  const location = useLocation();
  const { empresaNombre } = useParams();
  const navItems = [
    { name: 'Inicio', path: `/${empresaNombre}/home`, icon: <FaHome size={40} style={{marginRight:8}} /> },
    { name: 'Productos', path: `/${empresaNombre}/productos`, icon: <FaBoxOpen size={40} style={{marginRight:8}} /> },
    { name: 'Configuración', path: `/${empresaNombre}/config`, icon: <FaCog size={40} style={{marginRight:8}} /> },
  ];

  return (
    <nav className="empresa-navbar">
      <ul className="empresa-navbar-list">
        {navItems.map(item => (
          <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
            <Link to={item.path} style={{display:'flex',alignItems:'center',gap:4}}>
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <LogoutButton />
    </nav>
  );
};

export default EmpresaNavbar;
