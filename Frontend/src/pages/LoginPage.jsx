import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHamburger, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';

const login = async (email, password) => {
  const response = await axios.post(
    'http://localhost:8000/user/login/',
    { email, password }, // Esto es el body (data)
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  localStorage.setItem('token', response.data.access);
  localStorage.setItem('refresh', response.data.refresh);
  return response.data;
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.access && data.refresh && data.role) {
        setEmail('');
        setPassword('');
        if (data.role === 'repartidor') {
          navigate('/homerepartidor');
        } else if (data.role === 'empresa') {
          navigate(`/${data.empresaNombre}/home`); 
        }else {
          navigate('/homeuser');
        }
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: '#e3f0ff' }}>
      <div className="auth-container">
        <span className="auth-logo"><FaHamburger size={48} /></span>
        <h2 className="auth-title">Inicia sesión en MICO</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
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
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;