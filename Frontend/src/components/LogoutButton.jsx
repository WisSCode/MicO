import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
      <FiLogOut size={22} />
    </button>
  );
};

export default LogoutButton;
