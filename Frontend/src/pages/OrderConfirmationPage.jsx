import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaClock, FaUtensils, FaTruck, FaHome, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { useUser } from '../components/UserContext';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { fetchOrderHistory } = useUser();

  const orderStages = [
    { name: 'Pedido recibido', icon: FaCheckCircle, color: '#27ae60' },
    { name: 'Preparando', icon: FaUtensils, color: '#f39c12' },
    { name: 'En camino', icon: FaTruck, color: '#3498db' },
    { name: 'Entregado', icon: FaHome, color: '#27ae60' }
  ];

  useEffect(() => {
    setLoading(true);
    const orderId = location.state?.orderId;
    if (orderId) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('token');
      const url = `${API_BASE}/pedidos/${orderId}/`;
      console.log('URL que se está llamando:', url);
      console.log('Token:', token);
      axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          console.log('Respuesta exitosa del pedido:', res.data);
          setOrder(res.data);
          setLoading(false);
          // Refresca el historial después de cargar el pedido confirmado
          fetchOrderHistory();
        })
        .catch((error) => {
          console.error('Error completo:', error);
          console.error('Error response:', error.response);
          console.error('Error status:', error.response?.status);
          console.error('Error data:', error.response?.data);
          setOrder(null);
          setLoading(false);
        });
    } else {
      console.log('No hay orderId en location.state:', location.state);
      setOrder(null);
      setLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (!order) return;
    // Simulate order progress
    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < orderStages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>Buscando pedido...</div>
        <div style={{width:'40px',height:'40px',border:'4px solid #e5e7eb',borderTop:'4px solid #2563eb',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
        <style>{`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888',textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>No hay pedido para confirmar</div>
        <button className="btn-primary" style={{margin:'0.5rem'}} onClick={() => navigate('/')}>Ir al inicio</button>
        <button className="btn-outline" style={{margin:'0.5rem'}} onClick={() => navigate('/order-history')}>Ver historial</button>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.2rem', 
            cursor: 'pointer', 
            marginRight: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaArrowLeft />
        </button>
        <span style={{ fontWeight: 600 }}>Confirmación de pedido</span>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Success Message */}
        <div style={{ 
          background: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          textAlign: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <FaCheckCircle size={48} color="#27ae60" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#155724', fontSize: '1.5rem' }}>
            ¡Pedido confirmado!
          </h2>
          <p style={{ margin: 0, color: '#155724', fontSize: '1rem' }}>
            Tu pedido ha sido recibido y está siendo procesado
          </p>
        </div>

        {/* Order Details */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 600 }}>Detalles del pedido</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Número de pedido:</span>
              <span>{order.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Fecha:</span>
              <span>{order.fecha_pedido ? new Date(order.fecha_pedido).toLocaleDateString() : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Total:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>${order.total}</span>
            </div>
          </div>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div key={item.id || index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>{item.cantidad}x {item.producto_nombre}</span>
                <span>${item.precio_unitario * item.cantidad}</span>
              </div>
            ))
          ) : (
            <div style={{color:'#888',fontSize:'0.95rem'}}>Sin productos en este pedido</div>
          )}
        </div>

        {/* Delivery Information */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 600 }}>Información de entrega</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>{order.cliente_nombre}</strong>
          </div>
          {/* Si tienes dirección, muéstrala aquí */}
        </div>

        {/* Order Tracking */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 600 }}>Seguimiento del pedido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orderStages.map((stage, index) => {
              const IconComponent = stage.icon;
              const isActive = index <= currentStage;
              const isCompleted = index < currentStage;
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isCompleted ? stage.color : isActive ? stage.color : '#e5e5e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#fff' : '#999',
                    transition: 'all 0.3s ease'
                  }}>
                    <IconComponent size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: isActive ? 600 : 400, 
                      color: isActive ? '#2c3e50' : '#999',
                      fontSize: '1rem'
                    }}>
                      {stage.name}
                    </div>
                    {isActive && index < orderStages.length - 1 && (
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#666', 
                        marginTop: '0.25rem' 
                      }}>
                        {index === 0 && 'Tu pedido ha sido recibido y confirmado'}
                        {index === 1 && 'El restaurante está preparando tu comida'}
                        {index === 2 && 'Un repartidor está en camino con tu pedido'}
                      </div>
                    )}
                  </div>
                  {isCompleted && (
                    <FaCheckCircle size={20} color="#27ae60" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/order-history')}
            style={{ 
              flex: 1,
              padding: '1rem', 
              background: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Ver historial
          </button>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              flex: 1,
              padding: '1rem', 
              background: '#2c3e50', 
              color: '#fff',
              border: 'none', 
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Hacer otro pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;