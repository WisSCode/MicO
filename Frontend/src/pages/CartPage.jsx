
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/cart/my-cart/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(res.data.items || []);
      } catch (err) {
        setCart([]);
      }
      setLoading(false);
    };
    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        // Eliminar el producto si la cantidad es 0
        await axios.post(`${API_BASE}/cart/remove-item/`, {
          producto_id: productId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Actualizar la cantidad del producto
        await axios.post(`${API_BASE}/cart/add-item/`, {
          producto_id: productId,
          quantity: newQuantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // Refrescar carrito
      const res = await axios.get(`${API_BASE}/cart/my-cart/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data.items || []);
    } catch (err) {}
  };

  const removeItem = async (productId) => {
    try {
      await axios.post(`${API_BASE}/cart/remove-item/`, {
        producto_id: productId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refrescar carrito
      const res = await axios.get(`${API_BASE}/cart/my-cart/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data.items || []);
    } catch (err) {}
  };
  // Eliminada la versión antigua de removeItem para evitar duplicidad

  // Eliminada la función de aplicar cupón

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.producto.precio) * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    // Construir el pedido y guardarlo en localStorage
    const order = {
      items: cart.map(item => ({
        id: item.producto.id,
        name: item.producto.nombre,
        price: parseFloat(item.producto.precio),
        quantity: item.quantity,
        empresa: item.producto.empresa
      })),
      total: cart.reduce((total, item) => total + (parseFloat(item.producto.precio) * item.quantity), 0)
    };
    localStorage.setItem('pendingOrder', JSON.stringify(order));
    // Limpiar el carrito en el backend y frontend
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token');
    axios.post(`${API_BASE}/cart/clear/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setCart([]);
      navigate('/checkout');
    }).catch(() => {
      // Si falla, igual navega al checkout pero muestra el carrito vacío
      setCart([]);
      navigate('/checkout');
    });
  };

  if (loading) {
    return <div style={{textAlign:'center',padding:'3rem'}}>Cargando carrito...</div>;
  }
  if (!cart || cart.length === 0) {
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
        <span style={{ fontWeight: 600 }}>
          Carrito ({cart.reduce((acc, item) => acc + item.quantity, 0)} productos)
        </span>
      </div>

      <div className="cart-items" style={{ background: '#fff', marginBottom: '1rem' }}>
        {cart.map((item) => (
          <div key={item.id} style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={item.producto.imagen || 'https://source.unsplash.com/80x80/?food,burger'}
              alt={item.producto.nombre}
              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, marginRight: 16 }}
              onError={e => { e.target.onerror = null; e.target.src = 'https://source.unsplash.com/80x80/?food,burger'; }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>{item.producto.nombre}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{item.producto.empresa}</p>
              <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600, color: '#2c3e50' }}>${item.producto.precio}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => updateQuantity(item.producto.id, item.quantity - 1)}
                style={{ 
                  background: item.quantity <= 1 ? '#eee' : '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                  opacity: item.quantity <= 1 ? 0.5 : 1
                }}
                disabled={item.quantity <= 1}
              >
                <FaMinus size={10} />
              </button>
              <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.producto.id, item.quantity + 1)}
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
              onClick={() => removeItem(item.producto.id)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#e74c3c', 
                cursor: 'pointer',
                padding: '0.5rem',
                marginLeft: '0.5rem'
              }}
              title="Eliminar producto"
            >
              <FaTrash size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Se eliminó la sección de cupones */}

      <div className="cart-summary" style={{ background: '#fff', padding: '1rem' }}>
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