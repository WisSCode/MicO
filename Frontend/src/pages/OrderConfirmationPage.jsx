import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { useUser } from '../components/UserContext';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchOrderHistory } = useUser();

useEffect(() => {
    setLoading(true);
    // Si vienen pedidos por location.state, usarlos
    if (location.state && location.state.pedidos && Array.isArray(location.state.pedidos)) {
      setOrders(location.state.pedidos);
      setLoading(false);
      return;
    }
    // Si no, buscar pedidos confirmados en localStorage
    const confirmedOrders = localStorage.getItem('confirmedOrders');
    if (confirmedOrders) {
      try {
        const ordersArr = JSON.parse(confirmedOrders);
        setOrders(Array.isArray(ordersArr) ? ordersArr : [ordersArr]);
      } catch {
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
    setLoading(false);
  }, [location.state]);

  // UseEffect separado para cargar historial una sola vez al montar el componente
  useEffect(() => {
    fetchOrderHistory();
  }, []);

  if (loading) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>Buscando pedido...</div>
        <div style={{width:'40px',height:'40px',border:'4px solid #e5e7eb',borderTop:'4px solid #2563eb',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
        <style>{`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888',textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>No hay pedidos para confirmar</div>
        <button className="btn-primary" style={{margin:'0.5rem'}} onClick={() => navigate('/')}>Ir al inicio</button>
        <button className="btn-outline" style={{margin:'0.5rem'}} onClick={() => navigate('/order-history')}>Ver historial</button>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
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
            height: '32px',
            borderRadius: '50%',
            transition: 'background-color 0.2s',
            color: '#111'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaArrowLeft color="#111" />
        </button>
        <span style={{ fontWeight: 600 }}>Confirmación de pedidos</span>
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
            ¡Pedidos confirmados!
          </h2>
          <p style={{ margin: 0, color: '#155724', fontSize: '1rem' }}>
            Tus pedidos han sido recibidos y están siendo procesados
          </p>
        </div>

        {/* Mostrar cada pedido */}
        {orders.map((order, idx) => (
          <div key={order.id || idx} style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px #f8f8f8' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 600 }}>Pedido para {order.empresa_nombre || 'Empresa'}</h3>
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
            {/* Delivery Information */}
            <div style={{ marginTop: '1.5rem', background: '#f8f9fa', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Nombre: {order.cliente_nombre || 'Usuario'}</strong>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Método de pago: </strong>{order.metodo_pago || 'No especificado'}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Dirección de entrega: </strong>
                {order.direccion_completa ? (
                  <div style={{ marginTop: '0.25rem' }}>
                    <div>{order.direccion_nombre && `${order.direccion_nombre} - `}{order.direccion_completa}</div>
                    {order.direccion_referencia && (
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                        Referencia: {order.direccion_referencia}
                      </div>
                    )}
                  </div>
                ) : (
                  'No especificada'
                )}
              </div>
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>Ir al inicio</button>
          <button className="btn-outline" style={{marginLeft:'1rem'}} onClick={() => navigate('/order-history')}>Ver historial</button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;