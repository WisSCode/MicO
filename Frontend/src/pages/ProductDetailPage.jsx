import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';

const mockProducts = {
  1: { id: 1, name: 'Hamburguesa Clásica', price: 8.50, description: 'Deliciosa hamburguesa con carne 100% de res, lechuga, tomate, cebolla y queso cheddar. Served with fries.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', company: 'Burger Palace' },
  2: { id: 2, name: 'Hamburguesa Doble', price: 12.00, description: 'Doble carne con doble queso, bacon crujiente y salsa especial. Acompañada de papas fritas.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80', company: 'Burger Palace' },
  3: { id: 3, name: 'Pizza Margarita', price: 10.00, description: 'Pizza tradicional con salsa de tomate, mozzarella fresca y albahaca. Masa artesanal.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', company: 'Pizza Heaven' },
  4: { id: 4, name: 'Pizza Pepperoni', price: 13.00, description: 'Pizza con pepperoni, mozzarella y salsa de tomate. Perfecta para compartir.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80', company: 'Pizza Heaven' },
  5: { id: 5, name: 'Sushi Roll Clásico', price: 9.00, description: 'Roll de salmón fresco con aguacate y pepino. Served with wasabi and ginger.', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80', company: 'Sushi World' },
  6: { id: 6, name: 'Sashimi Mixto', price: 11.00, description: 'Sashimi de salmón fresco de alta calidad. Perfecto para los amantes del pescado crudo.', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80', company: 'Sushi World' },
};

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = mockProducts[productId];
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Producto no encontrado</h2>
          <button className="btn-primary" onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      company: product.company,
      image: product.image
    };
    
    // Add to localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    // Dispatch custom event to update cart count in header
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  return (
    <div className="product-detail-page">
      <div className="product-header" style={{ background: '#fff', padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center' }}>
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
        <span style={{ fontWeight: 600 }}>{product.company}</span>
      </div>

      <div className="product-image-container" style={{ height: '250px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={product.image} 
          alt={product.name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
          onError={e => { e.target.onerror = null; e.target.src = 'https://source.unsplash.com/400x220/?food,product'; }}
        />
      </div>

      <div className="product-info" style={{ padding: '1.5rem', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{product.name}</h1>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            {isFavorite ? <FaHeart color="#e74c3c" /> : <FaRegHeart color="#999" />}
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {product.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2c3e50' }}>
            ${product.price}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <FaMinus size={12} />
            </button>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{ 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <FaPlus size={12} />
            </button>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleAddToCart}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            fontSize: '1.1rem', 
            fontWeight: 600,
            borderRadius: '8px',
            background: '#2c3e50',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Agregar al carrito - ${product.price * quantity}
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage; 