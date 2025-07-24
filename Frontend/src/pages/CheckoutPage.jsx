import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaUser, FaMoneyBillWave, FaCreditCard, FaWallet } from 'react-icons/fa';
import AddressSelector from '../components/AddressSelector';
import '../styles/address-manager.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  useEffect(() => {
    // Primero verificar si hay datos del carrito para checkout
    const cartData = localStorage.getItem('cartDataForCheckout');
    const savedOrder = localStorage.getItem('confirmedOrders');
    
    if (cartData) {
      // Usar datos del carrito para crear el pedido
      const parsedCartData = JSON.parse(cartData);
      setOrderData(parsedCartData);
      
      // NO limpiar los datos del carrito aquí, se limpiarán después del checkout exitoso
    } else if (savedOrder) {
      // Verificar si hay pedidos ya creados (para compatibilidad)
      const parsedOrder = JSON.parse(savedOrder);
      
      // Verificar si los datos son pedidos ya creados (tienen ID y fecha_pedido)
      const areCreatedOrders = Array.isArray(parsedOrder) && 
        parsedOrder.length > 0 && 
        parsedOrder[0].id && 
        parsedOrder[0].fecha_pedido;
      
      if (areCreatedOrders) {
        // Si son pedidos ya creados, ir directamente a la página de confirmación
        localStorage.removeItem('confirmedOrders'); // Limpiar para evitar bucles
        navigate('/order-confirmation', { state: { pedidos: parsedOrder } });
        return;
      }
      
      setOrderData(parsedOrder);
    } else {
      // No hay datos de checkout, redirigir al carrito
      navigate('/cart');
      return;
    }

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
    if (!selectedAddress) newErrors.address = 'Dirección de entrega es requerida';
    
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
    // Soportar tanto array de pedidos como objeto único

    let pedidos = [];
    let productosInvalidos = [];
    if (Array.isArray(orderData)) {
      pedidos = orderData.map(pedido => {
        const itemsFiltrados = (pedido.items || []).map(item => {
          const producto_id = item.producto?.id || item.producto_id || item.id;
          if (!producto_id || isNaN(Number(producto_id))) {
            productosInvalidos.push(item.producto_nombre || item.name || 'Producto desconocido');
            return null;
          }
          return {
            producto_id,
            cantidad: item.quantity || item.cantidad,
          };
        }).filter(Boolean);
        return {
          empresa_id: pedido.empresa_id || pedido.empresa?.id,
          items: itemsFiltrados,
          metodo_pago: selectedPaymentMethod === 'cash' ? 'Efectivo' : selectedPaymentMethod === 'card' ? 'Tarjeta' : selectedPaymentMethod === 'yappy' ? 'Yappy' : 'Efectivo',
          direccion_entrega: selectedAddress ? {
            nombre: selectedAddress.nombre,
            direccion: selectedAddress.direccion,
            referencia: selectedAddress.referencia,
            latitud: selectedAddress.latitud,
            longitud: selectedAddress.longitud
          } : null,
          info_cliente: {
            nombre: formData.name,
            email: formData.email,
            telefono: formData.phone
          }
        };
      });
    } else if (orderData && orderData.items) {
      const itemsFiltrados = orderData.items.map(item => {
        const producto_id = item.producto?.id || item.producto_id || item.id;
        if (!producto_id || isNaN(Number(producto_id))) {
          productosInvalidos.push(item.producto_nombre || item.name || 'Producto desconocido');
          return null;
        }
        return {
          producto_id,
          cantidad: item.quantity || item.cantidad,
        };
      }).filter(Boolean);
      pedidos = [{
        empresa_id: orderData.empresa_id || orderData.empresa?.id,
        items: itemsFiltrados,
        metodo_pago: selectedPaymentMethod === 'cash' ? 'Efectivo' : selectedPaymentMethod === 'card' ? 'Tarjeta' : selectedPaymentMethod === 'yappy' ? 'Yappy' : 'Efectivo',
        direccion_entrega: selectedAddress ? {
          nombre: selectedAddress.nombre,
          direccion: selectedAddress.direccion,
          referencia: selectedAddress.referencia,
          latitud: selectedAddress.latitud,
          longitud: selectedAddress.longitud
        } : null,
        info_cliente: {
          nombre: formData.name,
          email: formData.email,
          telefono: formData.phone
        }
      }];
    } else {
      alert('No hay datos de pedido válidos.');
      return;
    }


    if (productosInvalidos.length > 0) {
      alert('Hay productos en el carrito que no tienen un ID válido y no se pueden procesar: ' + productosInvalidos.join(', ') + '\nPor favor, elimina estos productos del carrito e inténtalo de nuevo.');
      return;
    }

    // Filtrar pedidos con items vacíos
    pedidos = pedidos.filter(p => Array.isArray(p.items) && p.items.length > 0);
    if (pedidos.length === 0) {
      alert('No hay productos válidos en el carrito para procesar el pedido.');
      return;
    }

    // Validar que selectedPaymentMethod esté seleccionado
    if (!selectedPaymentMethod) {
      alert('Por favor selecciona un método de pago.');
      return;
    }

    // Crear pedidos usando el nuevo endpoint de múltiples pedidos
    const crearPedidos = async () => {
      try {
        const res = await axios.post(`${API_BASE}/pedidos/crear-multiple/`, { 
          pedidos 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const pedidosCreados = res.data.pedidos || [];
        
        // Limpiar carrito en backend
        try {
          await axios.post(`${API_BASE}/cart/clear-cart/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Disparar evento para actualizar contador del carrito
          window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
          // Si falla, igual continuamos
        }
        
        // Limpiar localStorage
        localStorage.removeItem('cart');
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('confirmedOrders');
        localStorage.removeItem('cartDataForCheckout'); // Limpiar datos del carrito usado para checkout
        
        // Navegar a confirmación
        navigate('/order-confirmation', { state: { pedidos: pedidosCreados } });
        
      } catch (err) {
        let msg = 'Error al crear los pedidos. Intenta de nuevo.';
        if (err.response && err.response.data) {
          if (typeof err.response.data === 'object') {
            // Mostrar errores específicos de validación
            if (err.response.data.error) {
              msg += `\n${err.response.data.error}`;
            }
            if (err.response.data.detalles) {
              msg += `\nDetalles: ${JSON.stringify(err.response.data.detalles, null, 2)}`;
            }
            // Si hay otros campos de error
            Object.keys(err.response.data).forEach(field => {
              if (field !== 'error' && field !== 'detalles') {
                const fieldErrors = err.response.data[field];
                if (Array.isArray(fieldErrors)) {
                  msg += `\n${field}: ${fieldErrors.join(', ')}`;
                } else {
                  msg += `\n${field}: ${fieldErrors}`;
                }
              }
            });
          } else if (typeof err.response.data === 'string' && err.response.data.startsWith('<!DOCTYPE html')) {
            msg += '\nError interno del servidor.';
          } else {
            msg += '\nDetalles: ' + err.response.data;
          }
        }
        alert(msg);
      }
    };
    
    crearPedidos();
  };

  const handleConfirmOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

      // Limpiar el carrito en el backend
      await axios.post(`${API_BASE}/cart/clear-cart/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (err) {
      // Error al confirmar el pedido o limpiar el carrito
    }
  };

  const handleYappyPayment = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('token');

      // Construir el payload para Yappy
      const payload = {
        amount: orderData.total,
        description: `Pago del pedido #${orderData.id}`,
        orderId: orderData.id,
      };

      // Realizar la solicitud a la API de Yappy
      const res = await axios.post(`${API_BASE}/yappy/payment/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Redirigir al usuario a la URL de pago de Yappy
      if (res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert('Error al procesar el pago con Yappy.');
      }
    } catch (err) {
      alert('Error al procesar el pago. Intenta de nuevo.');
    }
  };

  if (!orderData) {
    return <div style={{textAlign:'center',padding:'3rem'}}>Loading...</div>;
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
        <span style={{ fontWeight: 600 }}>Finalizar pedido</span>
      </div>

      <div style={{ padding: '1rem' }}>
        <div className="order-summary" style={{ background: '#fff', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Resumen del pedido</h3>
          {Array.isArray(orderData) ? (
            (() => {
              let totalGeneral = 0;
              return <>
                {orderData.map((pedido, idx) => {
                  // Obtener el nombre real de la empresa
                  let empresaNombre = '';
                  if (pedido.empresa_nombre) {
                    empresaNombre = pedido.empresa_nombre;
                  } else if (pedido.empresa && typeof pedido.empresa === 'object' && pedido.empresa.nombre) {
                    empresaNombre = pedido.empresa.nombre;
                  } else if (pedido.items && pedido.items[0] && pedido.items[0].producto && pedido.items[0].producto.empresa && pedido.items[0].producto.empresa.nombre) {
                    empresaNombre = pedido.items[0].producto.empresa.nombre;
                  } else {
                    empresaNombre = `Empresa #${pedido.empresa_id || idx+1}`;
                  }
                  // Calcular subtotal de la empresa
                  const subtotal = (pedido.items || []).reduce((sum, item) => sum + ((item.precio_unitario || item.price) * (item.cantidad || item.quantity)), 0);
                  totalGeneral += subtotal;
                  return (
                    <div key={idx} style={{ marginBottom: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '0.7rem' }}>
                      <div style={{ fontWeight: 700, color: '#f97316', marginBottom: '0.5rem' }}>
                        {empresaNombre}
                      </div>
                      {pedido.items && pedido.items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span>{item.cantidad || item.quantity}x {item.producto_nombre || item.name}</span>
                          <span>${(item.precio_unitario || item.price) * (item.cantidad || item.quantity)}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginTop: '0.5rem' }}>
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
                <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e5e5' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                  <span>Total:</span>
                  <span>${totalGeneral.toFixed(2)}</span>
                </div>
              </>;
            })()
          ) : (
            (() => {
              const subtotal = orderData.items ? orderData.items.reduce((sum, item) => sum + ((item.precio_unitario || item.price) * (item.cantidad || item.quantity)), 0) : 0;
              return <>
                {orderData.items && orderData.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{item.cantidad || item.quantity}x {item.producto_nombre || item.name}</span>
                    <span>${(item.precio_unitario || item.price) * (item.cantidad || item.quantity)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginTop: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </>;
            })()
          )}
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
              <AddressSelector
                selectedAddress={selectedAddress}
                onAddressChange={setSelectedAddress}
                placeholder="Seleccionar dirección de entrega"
              />
              {errors.address && <p style={{ margin: '0.25rem 0 0 0', color: '#e74c3c', fontSize: '0.8rem' }}>{errors.address}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Método de pago al entregar
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '1rem' }}>
              <button 
                type="button"
                onClick={() => setSelectedPaymentMethod('cash')}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '8px',
                  background: selectedPaymentMethod === 'cash' ? '#34d399' : '#f3f4f6',
                  color: selectedPaymentMethod === 'cash' ? '#fff' : '#374151',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                <FaMoneyBillWave size={32} />
                <span style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Efectivo</span>
              </button>
              <button 
                type="button"
                onClick={() => setSelectedPaymentMethod('card')}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '8px',
                  background: selectedPaymentMethod === 'card' ?  '#f97316' : '#f3f4f6',
                  color: selectedPaymentMethod === 'card' ? '#fff' : '#374151',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                <FaCreditCard size={32} />
                <span style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Tarjeta</span>
              </button>
              <button 
                type="button"
                onClick={() => setSelectedPaymentMethod('yappy')}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '8px',
                  background: selectedPaymentMethod === 'yappy' ? '#60a5fa' : '#f3f4f6',
                  color: selectedPaymentMethod === 'yappy' ? '#fff' : '#374151',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}
              >
                <FaWallet size={32} />
                <span style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Yappy</span>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedPaymentMethod}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              borderRadius: '8px',
              background: selectedPaymentMethod 
                ? 'linear-gradient(90deg, #f97316, #fdba74)' 
                : '#e5e7eb',
              color: selectedPaymentMethod ? '#fff' : '#9ca3af',
              border: 'none',
              cursor: selectedPaymentMethod ? 'pointer' : 'not-allowed',
              opacity: selectedPaymentMethod ? 1 : 0.6
            }}
          >
            {selectedPaymentMethod ? 'Procesar pago' : 'Selecciona método de pago'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;