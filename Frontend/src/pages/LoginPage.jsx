import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaStore, FaBicycle, FaCog, FaBicycle as FaDelivery } from "react-icons/fa";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const roles = [
    { id: 'cliente', name: 'Cliente', icon: FaUser, color: '#3b82f6' },
    { id: 'empresa', name: 'Empresa', icon: FaStore, color: '#10b981' },
    { id: 'repartidor', name: 'Repartidor', icon: FaDelivery, color: '#f97316' },
    { id: 'admin', name: 'Admin', icon: FaCog, color: '#8b5cf6' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { role: selectedRole, username, password });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaBicycle size={40} />
            </div>
          </div>
          <h1 className="app-title">MicO</h1>
          <p className="app-subtitle">Plataforma de Gestión de Entregas</p>
        </div>

        {/* Role Selection */}
        <div className="role-selection">
          <h2>Selecciona tu rol</h2>
          <div className="role-grid">
            {roles.map((role) => (
              <button
                key={role.id}
                className={`role-button ${selectedRole === role.id ? 'active' : ''}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <role.icon size={32} color={role.color} />
                <span>{role.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={!selectedRole}>
            Iniciar Sesión
          </button>
        </form>

        {/* Register Link */}
        <div className="register-link">
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;