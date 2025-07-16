import React from 'react';
import { Link } from 'react-router-dom';
import { FaHamburger } from "react-icons/fa";

const RegisterPage = () => {

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulación de registro - aquí iría la llamada real al backend
    try {
      // await register(name, email, password);
      console.log('Register attempt:', { name, email, password });
      // Por ahora solo simulamos éxito
    } catch (err) {
      setError('Error al registrar. Intenta nuevamente.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <FaHamburger size={60} color="#f97316" />
        </div>
        <h2 className="auth-title">Crea tu cuenta en MICO</h2>
        {error && <p className="auth-error">{error}</p>}
        
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
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary full-width">
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