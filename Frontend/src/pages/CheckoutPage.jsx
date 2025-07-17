import React, { useState, useEffect } from 'react';
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
    city: '',
    zipCode: '',
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
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad es requerida';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Código postal es requerido';
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

    const finalOrder = {
      ...orderData,
      customerInfo: formData,
      orderId: `ORD-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save order to localStorage for order history
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(finalOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Clear cart
    localStorage.removeItem('cart');
    localStorage.removeItem('pendingOrder');

    navigate('/order-confirmation', { state: { order: finalOrder } });
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <input
                  type="text"
                  name="city"
                  placeholder="Ciudad"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: `1px solid ${errors.city ? '#e74c3c' : '#dee2e6'}`, 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.city && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.city}</p>}
              </div>
              
              <div>
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Código postal"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: `1px solid ${errors.zipCode ? '#e74c3c' : '#dee2e6'}`, 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.zipCode && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.zipCode}</p>}
              </div>
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