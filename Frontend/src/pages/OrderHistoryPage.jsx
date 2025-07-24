
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import axios from 'axios';


const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mostrar los pedidos más recientes primero
  const filteredOrders = Array.isArray(orders) ? [...orders].reverse() : [];

  // Función para obtener el historial de pedidos directamente del backend
  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/pedidos/historial/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);


  if (loading) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>Cargando historial...</div>
        <div style={{width:'40px',height:'40px',border:'4px solid #e5e7eb',borderTop:'4px solid #2563eb',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
        <style>{`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-history-page">
        <div className="history-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
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
          <span style={{ fontWeight: 600 }}>Historial de pedidos</span>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <FaHome size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '1rem', color: '#666' }}>No hay pedidos aún</h2>
          <p style={{ color: '#999', marginBottom: '2rem' }}>Realiza tu primer pedido para verlo aquí</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
            style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              borderRadius: '8px',
              background: '#2c3e50',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="history-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)}
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
        <span style={{ fontWeight: 600 }}>Historial de pedidos ({orders.length})</span>
      </div>
      <div style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5' }} />
      <div style={{ padding: '1rem' }}>
        {filteredOrders.map((order) => (
          <div 
            key={order.id} 
            style={{ 
              background: '#f9fafb', 
              borderRadius: '14px', 
              padding: '2rem 1.7rem', 
              marginBottom: '2.2rem',
              border: '2px solid #e0e0e0',
              boxShadow: '0 4px 18px 0 rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
                  Pedido #{order.id}
                </h3>
                <span style={{ color: '#888', fontSize: '0.95rem' }}>
                  {order.fecha_pedido
                    ? `${new Date(order.fecha_pedido).toLocaleDateString()} - ${new Date(order.fecha_pedido).toLocaleTimeString()}`
                    : 'Sin fecha'}
                </span>
              </div>
              <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '1.1rem' }}>
                ${order.total}
              </div>
            </div>
            <div style={{ marginBottom: '0.5rem', color: '#666' }}>
              {order.items ? order.items.length : 0} productos
            </div>
            <div style={{ marginBottom: '0.5rem', color: '#888' }}>
              Rider: {order.rider_nombre ? order.rider_nombre : 'Sin asignar'}
            </div>
            {/* Productos del pedido */}
            {order.items && order.items.length > 0 && (
              <div style={{ marginTop: '0.5rem', color: '#444', fontSize: '0.97rem' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.5rem 0',
                      borderBottom: idx !== order.items.length - 1 ? '1px solid #e5e5e5' : 'none',
                      marginBottom: idx !== order.items.length - 1 ? '0.2rem' : 0
                    }}
                  >
                    {item.cantidad}x {item.producto_nombre} - ${item.precio_unitario * item.cantidad}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage; 