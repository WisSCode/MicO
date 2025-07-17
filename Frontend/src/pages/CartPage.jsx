import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const validCoupons = {
    'APPLE10': { desc: '10% OFF', discount: 0.1 },
    'ENVIOGRATIS': { desc: 'Envío gratis', discount: 0 },
    '2X1BURGER': { desc: '2x1 en Burger Palace', discount: 0.5 },
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    // Dispatch custom event to update cart count in header
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      const updatedCart = cart.filter(item => item.id !== productId);
      updateCart(updatedCart);
    } else {
      const updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      updateCart(updatedCart);
    }
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    updateCart(updatedCart);
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (validCoupons[code]) {
      setAppliedCoupon(validCoupons[code]);
      setCouponMessage('Cupón aplicado: ' + validCoupons[code].desc);
    } else {
      setAppliedCoupon(null);
      setCouponMessage('Cupón inválido');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    return appliedCoupon.discount * subtotal;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const orderData = {
      items: cart,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      coupon: appliedCoupon ? coupon : null,
      date: new Date().toISOString(),
    };
    
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
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
          <span style={{ fontWeight: 600 }}>Carrito</span>
        </div>
        
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#666' }}>Tu carrito está vacío</h2>
          <p style={{ color: '#999', marginBottom: '2rem' }}>Agrega algunos productos para continuar</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
            style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #f97316, #fdba74)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Explorar restaurantes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
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
        <span style={{ fontWeight: 600 }}>Carrito ({cart.length} items)</span>
      </div>

      <div className="cart-items" style={{ background: '#fff', marginBottom: '1rem' }}>
        {cart.map((item) => (
          <div key={item.id} style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={item.image}
              alt={item.name}
              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, marginRight: 16 }}
              onError={e => { e.target.onerror = null; e.target.src = 'https://source.unsplash.com/80x80/?food,burger'; }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>{item.name}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{item.company}</p>
              <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600, color: '#2c3e50' }}>${item.price}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FaMinus size={10} />
              </button>
              <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FaPlus size={10} />
              </button>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#e74c3c', 
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <FaTrash size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="coupon-section" style={{ background: '#fff', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Código de cupón"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              border: '1px solid #dee2e6', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}
          />
          <button 
            onClick={applyCoupon}
            style={{ 
              padding: '0.75rem 1rem', 
              background: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Aplicar
          </button>
        </div>
        {couponMessage && (
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            color: appliedCoupon ? '#27ae60' : '#e74c3c',
            fontWeight: 500
          }}>
            {couponMessage}
          </p>
        )}
      </div>

      <div className="cart-summary" style={{ background: '#fff', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Subtotal:</span>
          <span>${calculateSubtotal()}</span>
        </div>
        {appliedCoupon && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#27ae60' }}>
            <span>Descuento ({appliedCoupon.desc}):</span>
            <span>-${calculateDiscount()}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>
          <span>Total:</span>
          <span>${calculateTotal()}</span>
        </div>
        
        <button 
          className="btn-primary"
          onClick={handleCheckout}
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
          Proceder al pago
        </button>
      </div>
    </div>
  );
};

export default CartPage; 