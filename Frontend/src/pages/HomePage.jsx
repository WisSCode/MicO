import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="home-page" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ marginBottom: '2rem', fontWeight: 700 }}>¿Qué vas a pedir hoy?</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', width: '100%', maxWidth: 900 }}>
        <button className="btn-primary" style={{ background: 'linear-gradient(90deg, var(--primary-blue), var(--secondary-orange))', minWidth: 220 }} onClick={() => navigate('/login')}>Login</button>
        <button className="btn-primary" style={{ background: 'linear-gradient(90deg, var(--secondary-orange), var(--primary-blue))', minWidth: 220 }} onClick={() => navigate('/register')}>Registro</button>
        <button className="btn-primary" style={{ background: 'linear-gradient(90deg, var(--primary-blue-light), var(--secondary-orange))', minWidth: 220 }} onClick={() => navigate('/order')}>Hacer Pedido</button>
        <button className="btn-primary" style={{ background: 'linear-gradient(90deg, var(--secondary-orange), var(--primary-blue-dark))', minWidth: 220 }} onClick={() => navigate('/order')}>Estado del Pedido</button>
        <button className="btn-primary" style={{ background: 'linear-gradient(90deg, var(--primary-blue), var(--primary-blue-light))', minWidth: 220 }} onClick={() => navigate('/order-history')}>Historial de Pedidos</button>
        <button className="btn-primary" style={{ background: 'linear-gradient(90deg, var(--secondary-orange), var(--primary-blue))', minWidth: 220 }} onClick={() => navigate('/company/1/products')}>Productos por Empresa</button>
      </div>
    </div>
  );
};

export default HomePage;

