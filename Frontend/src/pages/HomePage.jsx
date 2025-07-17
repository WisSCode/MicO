import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaStore } from 'react-icons/fa';
import heroBg from '../assets/images/home.avif';
import '../styles/main.css';

import { fetchEmpresasPublic } from '../utils/empresas_public';

const MEDIA_URL = 'http://localhost:8000/media/';




const HomePage = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchEmpresasPublic().then(setEmpresas).catch(() => setEmpresas([]));
  }, []);

  const handleEmpresaClick = (empresa) => {
    // Navega usando el nombre de la empresa en la URL (asegura que sea el campo correcto)
    if (empresa && empresa.nombre) {
      navigate(`/${encodeURIComponent(empresa.nombre)}/products`);
    } else {
      alert('No se encontró el nombre de la empresa');
    }
  };

  const handleImageError = (e, empresa) => {
    e.target.style.display = 'none';
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = 'flex';
    }
    setImageErrors(prev => ({ ...prev, [empresa.id]: true }));
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

          {/* Empresas */}
          <div className="ue2-rest-list">
            {empresas.map(empresa => (
              <div 
                className="ue2-rest-card" 
                key={empresa.id}
                onClick={() => handleEmpresaClick(empresa)}
                style={{ cursor: 'pointer' }}
              >
                <div className="ue2-rest-img-wrap">
                  {empresa.logo ? (
                    <img 
                      src={empresa.logo.startsWith('http') ? empresa.logo : MEDIA_URL + empresa.logo}
                      alt={empresa.nombre}
                      className="ue2-rest-img"
                      onError={(e) => handleImageError(e, empresa)}
                    />
                  ) : (
                    <div className="ue2-rest-img-placeholder" style={{width:'100%',height:'100%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',color:'#9ca3af',fontSize:'2rem'}}>
                      <FaStore />
                    </div>
                  )}
                </div>
                <div className="ue2-rest-info">
                  <div className="ue2-rest-row1">
                    <span className="ue2-rest-name">{empresa.nombre}</span>
                  </div>
                  <div className="ue2-rest-addr"><FaMapMarkerAlt style={{marginRight:4}} />{empresa.direccion || 'Sin dirección'}</div>
                  <div className="ue2-rest-addr"><FaPhoneAlt style={{marginRight:4}} />{empresa.telefono || 'Sin teléfono'}</div>
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

