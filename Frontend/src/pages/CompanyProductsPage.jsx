

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaArrowLeft, FaStar, FaStore } from 'react-icons/fa';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';


const CompanyProductsPage = () => {
  const { empresaNombre } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    const fetchCompanyAndProducts = async () => {
      setLoading(true);
      try {
        // Buscar empresa por nombre
        const companyRes = await axios.get(`${API_BASE}/empresas/public/?search=${empresaNombre}`);
        // El endpoint público devuelve un array, busca coincidencia exacta por nombre
        let foundCompany = null;
        if (Array.isArray(companyRes.data)) {
          foundCompany = companyRes.data.find(e => e.nombre === decodeURIComponent(empresaNombre));
        } else {
          foundCompany = companyRes.data;
        }
        if (!foundCompany || !foundCompany.id) {
          setCompany(null);
          setProducts([]);
          setLoading(false);
          return;
        }
        setCompany(foundCompany);

        // Obtener productos de la empresa (asegura endpoint correcto)
        const productsRes = await axios.get(`${API_BASE}/empresas/${foundCompany.id}/products/`);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err) {
        setCompany(null);
        setProducts([]);
      }
      setLoading(false);
    };
    fetchCompanyAndProducts();
  }, [empresaNombre]);

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

  const token = localStorage.getItem('token');
  const handleAddToCart = async (product) => {
    try {
      await axios.post(`${API_BASE}/cart/add-item/`, {
        producto_id: product.id,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/cart');
    } catch (err) {
      alert('Error al agregar al carrito');
    }
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
              {company.nombre}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {company.direccion || 'Sin dirección'}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                Tel: {company.telefono || 'Sin teléfono'}
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
                  src={product.imagen ? (product.imagen.startsWith('http') ? product.imagen : `http://localhost:8000${product.imagen}`) : 'https://source.unsplash.com/170x150/?food,product'}
                  alt={product.nombre}
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
                    {product.nombre}
                  </h3>
                  <span style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 700, 
                    color: '#2c3e50',
                    marginLeft: '0.5rem'
                  }}>
                    ${product.precio}
                  </span>
                </div>

                <p style={{ 
                  margin: '0 0 0.75rem 0', 
                  fontSize: '0.9rem', 
                  color: '#666',
                  lineHeight: '1.4'
                }}>
                  {product.descripcion}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Puedes agregar más campos si el modelo los tiene */}
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