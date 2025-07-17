import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHamburger } from "react-icons/fa";
import { useUser } from '../components/UserContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setMsg('Completa todos los campos.');
      setMsgType('error');
      return;
    }
    try {
      login({ name, email, role: 'cliente' });
      setMsg('¡Registro exitoso!');
      setMsgType('success');
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setMsg('Error al registrar. Intenta nuevamente.');
      setMsgType('error');
    }
  };

  return (
    <div className="auth-page" style={{background:'#f5f5f5',minHeight:'100vh'}}>
      <div className="auth-container">
        <div className="auth-logo" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <span className="logo-text" style={{fontSize:'2.2rem',fontWeight:700}}>Mic</span>
          <span className="burger-icon"><FaHamburger size={40} /></span>
        </div>
        <h2 className="auth-title">Crea tu cuenta</h2>
        {msg && (
          <div style={{
            margin:'1rem 0',
            color: msgType==='error' ? 'var(--error)' : 'var(--gray-900)',
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
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{transition:'box-shadow 0.2s',boxShadow:name? '0 2px 8px 0 rgba(37,99,235,0.08)':'none'}}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{transition:'box-shadow 0.2s',boxShadow:email? '0 2px 8px 0 rgba(37,99,235,0.08)':'none'}}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{transition:'box-shadow 0.2s',boxShadow:password? '0 2px 8px 0 rgba(37,99,235,0.08)':'none'}}
            />
          </div>
          <button type="submit" className="btn-primary full-width" style={{transition:'box-shadow 0.2s',boxShadow:'0 2px 8px 0 rgba(37,99,235,0.10)',borderRadius:14}}>
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