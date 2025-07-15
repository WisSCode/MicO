import React from 'react';
import { Link } from 'react-router-dom';
import { FaHamburger } from "react-icons/fa";

const LoginPage = () => {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={FaHamburger} alt="MICO Logo" className="auth-logo" />
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
          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary full-width">
            Ingresar
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