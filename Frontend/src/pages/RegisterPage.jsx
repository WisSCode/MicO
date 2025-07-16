
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHamburger, FaUser, FaStore, FaBiking, FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/register.css';

const roleOptions = [
  {
    key: 'usuarionormal',
    label: 'Cliente',
    icon: <FaUser size={32} color="#2563eb" />, // azul
    color: '#e3f0ff',
  },
  {
    key: 'empresa',
    label: 'Empresa',
    icon: <FaStore size={32} color="#22c55e" />, // verde
    color: '#e6fbe8',
  },
  {
    key: 'repartidor',
    label: 'Repartidor',
    icon: <FaBiking size={32} color="#f97316" />, // naranja
    color: '#fff4e6',
  },
];

const register = async (data) => {
  const response = await fetch('http://localhost:8000/user/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || 'Error en el registro');
  }
  return await response.json();
};


const RegisterPage = () => {
  const [role, setRole] = useState('usuarionormal');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cambia el color de fondo según el rol
  const bgColor = roleOptions.find(r => r.key === role)?.color || '#fff';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      let data = { name, email, telefono, direccion, password, role };
      if (role === 'empresa') {
        data.empresa = { nombre: empresaNombre };
      }
      await register(data);
      setSuccess('¡Registro exitoso!');
      setName('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setPassword('');
      setEmpresaNombre('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page" style={{ background: bgColor, transition: 'background 0.3s' }}>
      <div className="auth-container">
        <span className="auth-logo"><FaHamburger size={48} /></span>
        <h2 className="auth-title">Crea tu cuenta en MICO</h2>
        <p style={{ textAlign: 'center', fontWeight: 500, marginBottom: 16 }}>Selecciona tu rol</p>
        <div className="role-btns">
          {roleOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setRole(opt.key)}
              className={`role-btn${role === opt.key ? ' selected' : ''}`}
            >
              {opt.icon}
              <span className="role-label">{opt.label}</span>
            </button>
          ))}
        </div>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
            />
          </div>
          {role === 'empresa' && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Nombre de la empresa"
                value={empresaNombre}
                onChange={(e) => setEmpresaNombre(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-hide-btn"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" className="btn-primary">
            Registrarse
          </button>
        </form>
        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;