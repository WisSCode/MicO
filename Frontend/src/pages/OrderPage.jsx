import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { FaArrowLeft, FaCheckCircle, FaClock, FaUtensils, FaTruck, FaHome, FaShoppingBag } from 'react-icons/fa';

const OrderPage = () => {
  const navigate = useNavigate();
  const { user, orders, updateOrder } = useUser();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Asegurar que orders sea un array
    const safeOrders = orders || [];
    // Filtrar solo pedidos activos (no entregados)
    const activeOrders = safeOrders.filter(order => 
      order.status !== 'completed' && order.status !== 'delivered'
    );
    setCurrentOrders(activeOrders);
    setTimeout(() => setLoading(false), 300); // Simula carga breve
  }, [orders]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <FaCheckCircle color="#27ae60" />;
      case 'preparing':
        return <FaUtensils color="#f39c12" />;
      case 'delivering':
        return <FaTruck color="#3498db" />;
      default:
        return <FaClock color="#95a5a6" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'Entregado';
      case 'preparing':
        return 'Preparando';
      case 'delivering':
        return 'En camino';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return '#27ae60';
      case 'preparing':
        return '#f39c12';
      case 'delivering':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const simulateOrderProgress = (orderId) => {
    const safeOrders = orders || [];
    const order = safeOrders.find(o => o.orderId === orderId);
    if (!order) return;

    const statuses = ['pending', 'preparing', 'delivering', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    
    if (currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      updateOrder(orderId, { status: nextStatus });
    }
  };

  if (loading) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>Cargando pedidos...</div>
        <div style={{width:'40px',height:'40px',border:'4px solid #e5e7eb',borderTop:'4px solid #2563eb',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
        <style>{`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (currentOrders.length === 0) {
    return (
      <div className="order-page">
        <div className="order-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
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
          <span style={{ fontWeight: 600 }}>Estado de Pedidos</span>
        </div>
        
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <FaShoppingBag size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '1rem', color: '#666' }}>No tienes pedidos activos</h2>
          <p style={{ color: '#999', marginBottom: '2rem' }}>Realiza un pedido para ver su estado aquí</p>
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
          <button 
            className="btn-outline"
            onClick={() => navigate('/order-history')}
            style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              borderRadius: '8px',
              marginLeft: '1rem'
            }}
          >
            Ver historial
          </button>
        </div>
      </div>
    );
  }


  // Asegurar que currentOrders sea un array antes de hacer map
  const safeCurrentOrders = currentOrders || [];

  return (
    <div className="order-page">
      <div className="order-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
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
        <span style={{ fontWeight: 600 }}>Estado de Pedidos ({safeCurrentOrders.length})</span>
      </div>

      {/* Renderizar cada pedido activo */}
      {safeCurrentOrders.map((order, orderIndex) => (
        <div key={order.orderId || orderIndex} style={{ margin: '2rem auto', maxWidth: 600, background: '#f9f9f9', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getStatusIcon(order.status)}
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Pedido</span>
              <span style={{ color: '#888', fontWeight: 400, fontSize: '0.95rem', marginLeft: 8 }}>ID: {order.orderId || order.id}</span>
            </div>
            <span style={{ color: getStatusColor(order.status), fontWeight: 500 }}>{getStatusText(order.status)}</span>
          </div>

          {/* Empresa */}
          {order.empresa_nombre && (
            <div style={{ marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 600, fontSize: '1rem' }}>
              Empresa: {order.empresa_nombre}
            </div>
          )}

          {/* Productos del pedido */}
          <div style={{ marginBottom: '1rem' }}>
            {(order.items || []).map((item, itemIndex) => {
              // Eliminar recuadro de imagen, solo mostrar info textual
              return (
                <div key={(item.producto_nombre || item.producto_id || 'item') + '-' + itemIndex} style={{
                  padding: '1rem',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: '#fff'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>{item.producto_nombre || (item.producto && item.producto.nombre) || 'Producto'}</h3>
                    {(item.producto_id || (item.producto && item.producto.id)) && (
                      <span style={{ fontSize: '0.8rem', color: '#aaa' }}>ID: {item.producto_id || (item.producto && item.producto.id)}</span>
                    )}
                    <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600, color: '#2c3e50' }}>${item.precio_unitario}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>{item.cantidad}x</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#2c3e50', minWidth: 60, textAlign: 'right' }}>${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {/* Order Total */}
          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem' }}>
              <span>Total:</span>
              <span>${order.total}</span>
            </div>
            {order.coupon && (
              <div style={{ fontSize: '0.9rem', color: '#27ae60', marginTop: '0.5rem' }}>
                Cupón aplicado: {order.coupon}
              </div>
            )}
          </div>

          {/* Order Progress (sin botón de simular progreso ni ver detalles) */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Progreso del pedido:</span>
            </div>
            {/* Progress Bar */}
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#e5e5e5', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${(['pending', 'preparing', 'delivering', 'delivered'].indexOf(order.status) + 1) * 25}%`,
                height: '100%',
                background: getStatusColor(order.status),
                transition: 'width 0.5s ease'
              }}></div>
            </div>
            {/* Progress Steps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              {['Pendiente', 'Preparando', 'En camino', 'Entregado'].map((step, index) => {
                const isCompleted = ['pending', 'preparing', 'delivering', 'delivered'].indexOf(order.status) >= index;
                return (
                  <div key={step} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isCompleted ? getStatusColor(order.status) : '#e5e5e5',
                      margin: '0 auto 0.25rem auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: isCompleted ? '#fff' : '#999'
                    }}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: isCompleted ? getStatusColor(order.status) : '#999',
                      fontWeight: isCompleted ? 600 : 400
                    }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderPage;