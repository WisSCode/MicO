import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHamburger, FaPizzaSlice, FaFish, FaIceCream, FaLeaf, FaDrumstickBite, FaBreadSlice, FaBacon, FaHotdog, FaUtensils, FaCoffee, FaCarrot, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import heroBg from '../assets/images/home.avif';
import '../styles/main.css';
import { UserContext } from '../components/UserContext';

const categories = [
  { id: 1, name: 'Comida rápida', icon: <FaHamburger size={36} /> },
  { id: 2, name: 'Desayuno y brunch', icon: <FaCoffee size={36} /> },
  { id: 3, name: 'Comida americana', icon: <FaHotdog size={36} /> },
  { id: 4, name: 'Comida mexicana', icon: <FaBacon size={36} /> },
  { id: 5, name: 'Comida china', icon: <FaUtensils size={36} /> },
  { id: 6, name: 'Comida italiana', icon: <FaPizzaSlice size={36} /> },
  { id: 7, name: 'Comida saludable', icon: <FaCarrot size={36} /> },
  { id: 8, name: 'Comida asiática', icon: <FaFish size={36} /> },
  { id: 9, name: 'Panadería', icon: <FaBreadSlice size={36} /> },
  { id: 10, name: 'Comfort food', icon: <FaIceCream size={36} /> },
  { id: 11, name: 'Pizza', icon: <FaPizzaSlice size={36} /> },
  { id: 12, name: 'Delicatesen', icon: <FaLeaf size={36} /> },
];

const restaurants = [
  {
    id: 1,
    name: 'Burger Palace',
    type: 'Hamburguesas • Americana',
    address: 'Avenida Central, Ciudad De David, Area Bancarea, Panama City, David 800',
    rating: 4.5,
    img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80',
    isNew: false,
    companyId: 1,
  },
  {
    id: 2,
    name: 'Pizza Heaven',
    type: 'Pizza • Italiana',
    address: 'Chiriquí, Distrito De David, Corregimiento De David(Cabecera) Calle 1 Este Urbanización David Centro',
    rating: 4.7,
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80',
    isNew: false,
    companyId: 2,
  },
  {
    id: 3,
    name: 'Sushi World',
    type: 'Sushi • Asiática',
    address: 'Plaza F507 Al Lado De Minimed, Panama City, David David',
    rating: 4.3,
    img: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    companyId: 3,
  },
  {
    id: 4,
    name: 'Popeyes Federal Mall',
    type: 'Fried Chicken • Pollo frito • Americana',
    address: 'Vía Boquete, David, Provincia De Chiriquí, Panamá, LATAM 0000',
    rating: 4.2,
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    companyId: 1,
  },
  {
    id: 5,
    name: 'Kotowa Coffee House (Kenny Serracin)',
    type: 'Café y té • Americana • Desayuno y brunch • Keto • Panadería',
    address: 'Distrito De David, Corregimiento David Cabecera, Calle E Norte 606, Edificio Frente Al Estadio Kenny',
    rating: 4.6,
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    companyId: 3,
  },
  {
    id: 6,
    name: 'Kotowa Coffee House (Terrazas de David)',
    type: 'Café y té • Americana • Desayuno y brunch • Keto • Panadería',
    address: 'Distrito De David, Corregimiento De David, Calle Via Interamericana, Plaza Terrazas De David',
    rating: 4.4,
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    companyId: 3,
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState({});
  const [address, setAddress] = useState("");
  const { user } = useContext(UserContext); // <-- Nuevo

  // HERO NUEVO
  const handleRestaurantClick = (restaurant) => {
    if (user) {
      navigate(`/company/${restaurant.companyId}/products`);
    } else {
      navigate('/login'); // Redirige a login si no está autenticado
    }
  };

  const handleCategoryClick = (category) => {
    if (user) {
      alert(`Categoría seleccionada: ${category.name}`);
      // Aquí podrías navegar a la categoría si lo deseas
    } else {
      navigate('/login');
    }
  };

  const handleImageError = (e, restaurant) => {
    if (restaurant.fallbackImg && e.target.src !== restaurant.fallbackImg) {
      e.target.src = restaurant.fallbackImg;
    } else {
      // If fallback also fails, show a placeholder
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
      setImageErrors(prev => ({ ...prev, [restaurant.id]: true }));
    }
  };

  return (
    <div className="ue2-home" style={{padding:0,margin:0}}>
      {/* HERO ILUSTRADO FULL WIDTH */}
      <section
        style={{
          minHeight: '100vh',
          width: '100vw',
          position: 'relative',
          left: 0,
          top: 0,
          margin: 0,
          padding: 0,
          background: `url(${heroBg}) center center/cover no-repeat, #fce4ec`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          paddingTop: '1.5rem',
          transform: 'translateY(-40px)',
        }}>
          <h1 style={{
            fontSize: '2.3rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '2.2rem',
            textAlign: 'center',
            textShadow: '0 2px 12px #fff8',
          }}>
            Entregas de comida en Panamá
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '0.5rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
              padding: '0.2rem 0.2rem 0.2rem 1rem',
              minWidth: 340,
              maxWidth: 420,
              width: '100%',
              height: 48,
            }}>
              <FaMapMarkerAlt style={{ color: '#f97316', fontSize: '1.2rem', marginRight: 8 }} />
              <input
                type="text"
                placeholder="Ingresa la dirección de entrega"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  flex: 1,
                  padding: '0.7rem 0.5rem',
                  background: 'transparent',
                  height: '100%',
                }}
              />
            </div>
            <button
              style={{
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1rem',
                height: 48,
                padding: '0 1.2rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                minWidth: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => alert(`Buscando comida para: ${address}`)}
              disabled={!address.trim()}
            >
              Buscar comida
            </button>
          </div>
        </div>
      </section>
      {/* CONTENIDO CENTRADO DEBAJO DEL HERO - CARD GRANDE CENTRADA */}
      <div style={{
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        margin: 0,
        padding: 0,
        background: 'transparent',
      }}>
        <section style={{
          borderRadius: 24,
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto',
          padding: '2.5rem 2.5rem 3rem 2.5rem',
          minHeight: '60vh',
        }}>
          {/* Breadcrumb */}
          <nav className="ue2-breadcrumb">
            <span>Panamá</span>
            <span className="ue2-bc-sep">&gt;</span>
            <span>Chiriquí</span>
            <span className="ue2-bc-sep">&gt;</span>
            <span className="ue2-bc-current">David</span>
          </nav>
          {/* Título y descripción */}
          <h1 className="ue2-title">Comida a Domicilio en David</h1>
          <div className="ue2-desc">
            Recibe en casa la comida de tu restaurante favorito en David con la app de Mic. Encuentra lugares nuevos cerca de ti para comer en David, ya sea para pedir desayunos, almuerzos, cenas o refrigerios. Explora cientos de opciones de comida a domicilio, haz el pedido y síguelo minuto a minuto.
          </div>
          <hr className="ue2-sep" />
          {/* Categorías */}
          <div className="ue2-cat-header-row">
            <h2 className="ue2-cat-title">Explorar por categoría</h2>
          </div>
          <div className="ue2-categories-grid">
            {categories.map(cat => (
              <div 
                className="ue2-cat-card" 
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                style={{ cursor: 'pointer', background: 'transparent' }}
              >
                <div className="ue2-cat-icon">{cat.icon}</div>
                <div className="ue2-cat-name">{cat.name}</div>
              </div>
            ))}
          </div>
          {/* Restaurantes */}
          <div className="ue2-rest-list">
            {restaurants.map(r => (
              <div 
                className="ue2-rest-card" 
                key={r.id}
                onClick={() => handleRestaurantClick(r)}
                style={{ cursor: 'pointer' }}
              >
                <div className="ue2-rest-img-wrap">
                  <img 
                    src={r.img} 
                    alt={r.name} 
                    className="ue2-rest-img" 
                    onError={(e) => handleImageError(e, r)}
                  />
                  <div 
                    className="ue2-rest-img-placeholder" 
                    style={{
                      display: imageErrors[r.id] ? 'flex' : 'none',
                      width: '100%',
                      height: '100%',
                      background: '#e5e7eb',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      fontSize: '2rem'
                    }}
                  >
                    <FaUtensils />
                  </div>
                </div>
                <div className="ue2-rest-info">
                  <div className="ue2-rest-row1">
                    <span className="ue2-rest-name">{r.name}</span>
                    {r.rating && <span className="ue2-rest-rating"><FaStar style={{marginRight:3}} />{r.rating}</span>}
                    {r.isNew && <span className="ue2-rest-new">Nuevo</span>}
                  </div>
                  <div className="ue2-rest-type">{r.type}</div>
                  <div className="ue2-rest-addr">{r.address}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

