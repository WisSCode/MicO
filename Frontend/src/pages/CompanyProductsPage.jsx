import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaArrowLeft, FaStar, FaStore } from 'react-icons/fa';
import '../styles/main.css';

const mockCompanies = [
  { id: 1, name: 'Burger Palace', rating: 4.5, deliveryTime: '20-30 min', minOrder: '$5', category: 'Hamburguesas' },
  { id: 2, name: 'Pizza Heaven', rating: 4.7, deliveryTime: '25-35 min', minOrder: '$8', category: 'Pizzas' },
  { id: 3, name: 'Sushi World', rating: 4.3, deliveryTime: '30-40 min', minOrder: '$12', category: 'Sushi' },
];

const mockProducts = {
  1: [
    { id: 1, name: 'Hamburguesa Clásica', price: 8.50, description: 'Carne 100% de res, lechuga, tomate, cebolla y queso cheddar', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', rating: 4.3, prepTime: '15 min' },
    { id: 2, name: 'Hamburguesa Doble', price: 12.00, description: 'Doble carne con doble queso, bacon crujiente y salsa especial', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80', rating: 4.6, prepTime: '18 min' },
    { id: 3, name: 'Combo Clásico', price: 15.50, description: 'Hamburguesa + papas fritas + bebida', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80', rating: 4.4, prepTime: '20 min' },
    { id: 4, name: 'Nuggets de Pollo', price: 9.00, description: '8 piezas de nuggets con salsa a elección', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80', rating: 4.1, prepTime: '12 min' },
  ],
  2: [
    { id: 3, name: 'Pizza Margarita', price: 10.00, description: 'Salsa de tomate, mozzarella fresca y albahaca', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', rating: 4.5, prepTime: '25 min' },
    { id: 4, name: 'Pizza Pepperoni', price: 13.00, description: 'Pepperoni, mozzarella y salsa de tomate', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80', rating: 4.7, prepTime: '28 min' },
    { id: 5, name: 'Pizza Hawaiana', price: 14.50, description: 'Jamón, piña, mozzarella y salsa de tomate', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', rating: 4.2, prepTime: '30 min' },
    { id: 6, name: 'Pizza Cuatro Quesos', price: 16.00, description: 'Mozzarella, parmesano, gorgonzola y provolone', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80', rating: 4.8, prepTime: '32 min' },
  ],
  3: [
    { id: 5, name: 'Sushi Roll Clásico', price: 9.00, description: 'Salmón fresco con aguacate y pepino', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80', rating: 4.6, prepTime: '20 min' },
    { id: 6, name: 'Sashimi Mixto', price: 11.00, description: 'Sashimi de salmón, atún y camarón', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80', rating: 4.9, prepTime: '15 min' },
    { id: 7, name: 'Combo Sushi', price: 18.50, description: '2 rolls + sopa miso + ensalada', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80', rating: 4.7, prepTime: '25 min' },
    { id: 8, name: 'Tempura Roll', price: 12.00, description: 'Camarón tempura con aguacate y salsa especial', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80', rating: 4.4, prepTime: '22 min' },
  ],
};

const CompanyProductsPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const company = mockCompanies.find(c => c.id === Number(companyId));
  const products = mockProducts[companyId] || [];
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  }, [companyId]);

  if (loading) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>Cargando productos...</div>
        <div style={{width:'40px',height:'40px',border:'4px solid #e5e7eb',borderTop:'4px solid #2563eb',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
        <style>{`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (!company) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888',textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>Empresa no encontrada</div>
        <button className="btn-primary" style={{margin:'0.5rem'}} onClick={() => navigate('/')}>Ir al inicio</button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'#888',textAlign:'center'}}>
        <FaStore size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>No hay productos para esta empresa</div>
        <button className="btn-primary" style={{margin:'0.5rem'}} onClick={() => navigate('/')}>Ir al inicio</button>
      </div>
    );
  }

  const toggleFav = (id) => {
    setFavs(favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      company: company.name,
      image: product.image
    };
    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        padding: '1rem', 
        borderBottom: '1px solid #e5e5e5',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.2rem', 
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#222' }}>
              {company.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: '#666' }}>
                <FaStar color="#f97316" size={12} />
                {company.rating}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {company.deliveryTime}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                Mín. {company.minOrder}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ padding: '1rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {products.map(product => (
            <div key={product.id} style={{
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}>
              {/* Product Image */}
              <div style={{ 
                height: '200px', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={product.image}
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                  onError={e => { e.target.onerror = null; e.target.src = 'https://source.unsplash.com/170x150/?food,product'; }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(product.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {favs.includes(product.id) ? 
                    <FaHeart color="#e74c3c" size={16} /> : 
                    <FaRegHeart color="#666" size={16} />
                  }
                </button>
              </div>

              {/* Product Info */}
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    color: '#222',
                    flex: 1
                  }}>
                    {product.name}
                  </h3>
                  <span style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 700, 
                    color: '#2c3e50',
                    marginLeft: '0.5rem'
                  }}>
                    ${product.price}
                  </span>
                </div>

                <p style={{ 
                  margin: '0 0 0.75rem 0', 
                  fontSize: '0.9rem', 
                  color: '#666',
                  lineHeight: '1.4'
                }}>
                  {product.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#666' }}>
                    <FaStar color="#f97316" size={12} />
                    {product.rating}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    {product.prepTime}
                  </span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    background: 'linear-gradient(90deg, #f97316, #fdba74)', 
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'linear-gradient(90deg, #ea580c, #f97316)'}
                  onMouseOut={(e) => e.target.style.background = 'linear-gradient(90deg, #f97316, #fdba74)'}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyProductsPage; 