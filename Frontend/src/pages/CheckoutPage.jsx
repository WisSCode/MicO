import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedOrder = localStorage.getItem('pendingOrder');
    if (!savedOrder) {
      navigate('/cart');
      return;
    }
    setOrderData(JSON.parse(savedOrder));

    // Obtener datos del usuario autenticado
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const res = await axios.get(`${API_BASE.replace(/\/api$/, '')}/user/profile/`, { 
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data;
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.telefono || '',
          address: user.direccion || '',
        }));
      } catch (err) {
        // No autocompletar si hay error
      }
    };
    fetchUserProfile();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
    // Eliminados ciudad y código postal
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Número de tarjeta es requerido';
    if (!formData.cardName.trim()) newErrors.cardName = 'Nombre en tarjeta es requerido';
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Fecha de expiración es requerida';
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Construir el payload para el backend
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token');
    // Obtener el id de la empresa del primer producto
    const empresaId = orderData.items[0]?.producto?.empresa || orderData.items[0]?.empresa || orderData.items[0]?.empresa_id;
    const items = orderData.items.map(item => ({
      producto_id: item.producto?.id || item.producto_id || item.id,
      cantidad: item.quantity,
    }));
    const payload = {
      empresa_id: empresaId,
      items,
    };
    axios.post(`${API_BASE}/pedidos/`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        console.log('Respuesta del backend:', res.data); // <-- Agrega esta línea
        localStorage.removeItem('cart');
        localStorage.removeItem('pendingOrder');
        navigate('/order-confirmation', { state: { orderId: res.data.id } });
      })
      .catch(err => {
        let msg = 'Error al crear el pedido. Intenta de nuevo.';
        if (err.response && err.response.data) {
          if (typeof err.response.data === 'object') {
            msg += '\n' + JSON.stringify(err.response.data);
          } else if (typeof err.response.data === 'string' && err.response.data.startsWith('<!DOCTYPE html')) {
            msg += '\nError interno del servidor.';
          } else {
            msg += '\n' + err.response.data;
          }
        }
        alert(msg);
      });
  };

  if (!orderData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/cart')}
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
        <span style={{ fontWeight: 600 }}>Finalizar pedido</span>
      </div>

      <div style={{ padding: '1rem' }}>
        <div className="order-summary" style={{ background: '#fff', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Resumen del pedido</h3>
          {orderData.items.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{item.quantity}x {item.name}</span>
              <span>${item.price * item.quantity}</span>
            </div>
          ))}
          <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e5e5' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>Total:</span>
            <span>${orderData.total}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaUser size={16} />
              Información personal
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: `1px solid ${errors.name ? '#e74c3c' : '#dee2e6'}`, 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.name && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.name}</p>}
              </div>
              
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: `1px solid ${errors.email ? '#e74c3c' : '#dee2e6'}`, 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.email && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.email}</p>}
              </div>
            </div>
            
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: `1px solid ${errors.phone ? '#e74c3c' : '#dee2e6'}`, 
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
              {errors.phone && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.phone}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaMapMarkerAlt size={16} />
              Dirección de entrega
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="address"
                placeholder="Dirección"
                value={formData.address}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: `1px solid ${errors.address ? '#e74c3c' : '#dee2e6'}`, 
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
              {errors.address && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.address}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCreditCard size={16} />
              Información de pago
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="cardNumber"
                placeholder="Número de tarjeta"
                value={formData.cardNumber}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: `1px solid ${errors.cardNumber ? '#e74c3c' : '#dee2e6'}`, 
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
              {errors.cardNumber && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.cardNumber}</p>}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="cardName"
                placeholder="Nombre en la tarjeta"
                value={formData.cardName}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: `1px solid ${errors.cardName ? '#e74c3c' : '#dee2e6'}`, 
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
              {errors.cardName && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.cardName}</p>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/AA"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: `1px solid ${errors.expiryDate ? '#e74c3c' : '#dee2e6'}`, 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.expiryDate && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.expiryDate}</p>}
              </div>
              
              <div>
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: `1px solid ${errors.cvv ? '#e74c3c' : '#dee2e6'}`, 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.cvv && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.cvv}</p>}
              </div>
            </div>
          </div>

          <button 
            type="submit"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #f97316, #fdba74)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Confirmar pedido - ${orderData.total}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage; 