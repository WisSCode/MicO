import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaStore, FaBicycle, FaCog, FaBicycle as FaDelivery, FaHamburger } from "react-icons/fa";
import { useUser } from '../components/UserContext';

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const roles = [
    { id: 'cliente', name: 'Cliente', icon: FaUser, color: '#3b82f6' },
    { id: 'empresa', name: 'Empresa', icon: FaStore, color: '#10b981' },
    { id: 'repartidor', name: 'Repartidor', icon: FaDelivery, color: '#f97316' },
    { id: 'admin', name: 'Admin', icon: FaCog, color: '#8b5cf6' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRole || !username || !password) {
      setMsg('Completa todos los campos y selecciona un rol.');
      setMsgType('error');
      return;
    }
    login({ username, role: selectedRole });
    setMsg('¡Login exitoso!');
    setMsgType('success');
    setTimeout(() => navigate('/'), 900);
  };

  return (
    <div className="login-page" style={{background:'#f5f5f5',minHeight:'100vh'}}>
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="logo-container" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <span className="logo-text" style={{fontSize:'2.2rem',fontWeight:700}}>Mic</span>
            <span className="burger-icon"><FaHamburger size={40} /></span>
          </div>
          <p className="app-subtitle">Plataforma de Gestión de Entregas</p>
        </div>
        {msg && (
          <div style={{
            margin:'1rem 0',
            color: msgType==='error' ? 'var(--error)' : 'var(--accent-green)',
            background: msgType==='error' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
            borderRadius:12,
            padding:'0.7rem 1.2rem',
            fontWeight:500,
            fontSize:'1.05rem',
            textAlign:'center',
            transition:'all 0.3s',
            animation:'fadeIn 0.5s',
          }}>{msg}</div>
        )}
        {/* Role Selection */}
        <div className="role-selection">
          <h2>Selecciona tu rol</h2>
          <div className="role-grid">
            {roles.map((role) => (
              <button
                key={role.id}
                className={`role-button ${selectedRole === role.id ? 'active' : ''}`}
                onClick={() => setSelectedRole(role.id)}
                tabIndex={0}
                aria-label={role.name}
                style={{outline:selectedRole===role.id?'2px solid var(--primary-blue)':'none',transition:'outline 0.2s'}}
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
              style={{transition:'box-shadow 0.2s',boxShadow:username? '0 2px 8px 0 rgba(37,99,235,0.08)':'none'}}
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
              style={{transition:'box-shadow 0.2s',boxShadow:password? '0 2px 8px 0 rgba(37,99,235,0.08)':'none'}}
            />
          </div>
          <button type="submit" className="login-button" disabled={!selectedRole} style={{transition:'box-shadow 0.2s',boxShadow:'0 2px 8px 0 rgba(37,99,235,0.10)',borderRadius:14}}>
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