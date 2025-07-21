import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaClock, FaUtensils, FaTruck, FaHome, FaFilter, FaSearch } from 'react-icons/fa';
import { useUser } from '../components/UserContext';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { orders } = useUser();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let filtered = [...orders].reverse(); // Show newest first

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(order => order.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
    setTimeout(() => setLoading(false), 300);
  }, [orders, filter, searchTerm]);

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

  const getTotalItems = (order) => {
    return order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

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
        <span style={{ fontWeight: 600 }}>Historial de pedidos ({orders.length})</span>
      </div>

      {/* Filters and Search */}
      <div style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaFilter size={14} color="#666" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ 
                padding: '0.5rem', 
                border: '1px solid #dee2e6', 
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">Todos los pedidos</option>
              <option value="pending">Pendientes</option>
              <option value="preparing">Preparando</option>
              <option value="delivering">En camino</option>
              <option value="delivered">Entregados</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
            <FaSearch size={14} color="#666" />
            <input
              type="text"
              placeholder="Buscar por número de pedido, producto o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                flex: 1,
                padding: '0.5rem', 
                border: '1px solid #dee2e6', 
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>
        
        {filteredOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
            No se encontraron pedidos con los filtros aplicados
          </div>
        )}
      </div>

      <div style={{ padding: '1rem' }}>
        {filteredOrders.map((order, index) => (
          <div 
            key={order.id} 
            style={{ 
              background: '#fff', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              marginBottom: '1rem',
              border: '1px solid #e5e5e5',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
            onClick={() => navigate('/order-confirmation', { state: { orderId: order.id } })}
          >
            {/* Order Header */}
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
              {order.estado}
            </div>
            {/* Productos del pedido */}
            {order.items && order.items.length > 0 && (
              <div style={{ marginTop: '0.5rem', color: '#444', fontSize: '0.97rem' }}>
                {order.items.map((item, idx) => (
                  <div key={idx}>
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