import React, { useEffect, useState } from 'react';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/repartidor-home.css';
import { FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


const MAPTILER_KEY = 'HGPx4i0Pm39GPzeBQ2Q0';

const HomeRepartidorPage = () => {
  const [stats, setStats] = useState({ total: 0, entregadas: 0, pendientes: 0 });
  const [pedidos, setPedidos] = useState([]);
  const [porAceptar, setPorAceptar] = useState([]);
  const [mapPedido, setMapPedido] = useState(null); // id del pedido a mostrar en mapa
  const [mapInstance, setMapInstance] = useState(null);
  const navigate = useNavigate();
  // Usar el id del modelo Repartidor, no el del usuario
  const repartidorId = Number(localStorage.getItem('repartidor_model_id'));

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/pedidos/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPedidos(res.data);
        setPorAceptar(res.data.filter(p => !p.repartidor && p.estado === 'pendiente'));
        // Estadísticas básicas solo para pedidos del repartidor actual
        const pedidosRepartidor = res.data.filter(p => (p.repartidor === repartidorId || p.repartidor_id === repartidorId));
        const entregadas = pedidosRepartidor.filter(p => p.estado === 'entregado').length;
        const pendientes = pedidosRepartidor.filter(p => p.estado !== 'entregado').length;
        setStats({ total: pedidosRepartidor.length, entregadas, pendientes });
      } catch (err) {
        if (err.response && err.response.status === 401) {
          alert('Sesión expirada o no autorizada. Por favor inicia sesión nuevamente.');
          localStorage.removeItem('access');
          navigate('/login');
        } else {
          alert('Error al cargar pedidos.');
        }
        setPedidos([]);
        setPorAceptar([]);
        setStats({ total: 0, entregadas: 0, pendientes: 0 });
      }
    };
    fetchPedidos();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const showMap = async () => {
      if (mapPedido !== null) {
        const pedido = pedidos.find(p => p.id === mapPedido);
        if (pedido && !mapInstance) {
          let lat = pedido.lat, lng = pedido.lng;
          // Si no hay lat/lng, geocodifica la dirección
          if ((lat === undefined || lng === undefined) && pedido.direccion) {
            try {
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pedido.direccion)}`);
              const geoData = await geoRes.json();
              if (geoData && geoData[0]) {
                lat = parseFloat(geoData[0].lat);
                lng = parseFloat(geoData[0].lon);
              }
            } catch {}
          }
          if (lat && lng) {
            const map = new maplibregl.Map({
              container: 'mapbox-map',
              style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
              center: [lng, lat],
              zoom: 15,
            });
            new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
            if (!cancelled) setMapInstance(map);
          }
        }
      }
    };
    showMap();
    // Cleanup
    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
    // eslint-disable-next-line
  }, [mapPedido]);

  const marcarEntregado = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/pedidos/${id}/`, { estado: 'entregado', repartidor_id: repartidorId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(pedidos => pedidos.map(p => p.id === id ? { ...p, estado: 'entregado', repartidor: repartidorId } : p));
      setStats(s => ({ ...s, entregadas: s.entregadas + 1, pendientes: Math.max(s.pendientes - 1, 0) }));
    } catch (err) { 
      alert('No se pudo marcar como entregado.');
    }
  };

  const aceptarPedido = async (id) => {
    try {
      const token = localStorage.getItem('token');
      // Asigna el pedido al repartidor con el id correcto
      let patchData = repartidorId ? { repartidor_id: repartidorId } : {};
      const res = await axios.patch(`http://localhost:8000/api/pedidos/${id}/`, patchData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPorAceptar(porAceptar => porAceptar.filter(p => p.id !== id));
      setPedidos(pedidos => pedidos.map(p => p.id === id ? res.data : p));
    } catch (err) {
      alert('No se pudo aceptar el pedido.');
    }
  };

  return (
    <div className="repartidor-home" style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <button
        style={{
          marginBottom: 16,
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0001'
        }}
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              // Mostrar mapa con ubicación actual
              if (!mapInstance) {
                const map = new maplibregl.Map({
                  container: 'mapbox-map',
                  style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
                  center: [lng, lat],
                  zoom: 15,
                });
                new maplibregl.Marker({ color: '#2563eb' }).setLngLat([lng, lat]).addTo(map);
                setMapInstance(map);
                setMapPedido(null); // Oculta pedido seleccionado
              }
            }, err => {
              alert('No se pudo obtener la ubicación del dispositivo.');
            });
          } else {
            alert('Geolocalización no soportada en este navegador.');
          }
        }}
      >Ver mi ubicación actual</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Panel de Repartidor</h2>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f1f5f9',
            color: '#2563eb',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0001'
          }}
          onClick={() => navigate('/repartidor/config')}
        >
          <FaCog style={{ fontSize: 18 }} />
          Información General
        </button>
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1, background: '#e0f2fe', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.total}</div>
          <div>Total de entregas</div>
        </div>
        <div style={{ flex: 1, background: '#bbf7d0', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.entregadas}</div>
          <div>Entregadas</div>
        </div>
        <div style={{ flex: 1, background: '#fee2e2', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.pendientes}</div>
          <div>Pendientes</div>
        </div>
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Pedidos en curso</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {pedidos.filter(p => p.estado !== 'entregado' && (p.repartidor === repartidorId || p.repartidor_id === repartidorId)).length === 0 && (
          <div style={{ color: '#64748b' }}>No tienes pedidos en curso.</div>
        )}
        {pedidos.filter(p => p.estado !== 'entregado' && (p.repartidor === repartidorId || p.repartidor_id === repartidorId)).map(pedido => (
          <div key={pedido.id} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{pedido.cliente_nombre || pedido.cliente || 'Cliente'}</div>
              <div style={{ color: '#2563eb', fontSize: 15 }}>{pedido.direccion}</div>
            </div>
            <button onClick={async () => {
              // Limpia el mapa anterior si existe
              if (mapInstance) {
                mapInstance.remove();
                setMapInstance(null);
              }
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async pos => {
                  const myLat = pos.coords.latitude;
                  const myLng = pos.coords.longitude;
                  let clientLat = pedido.lat, clientLng = pedido.lng;
                  // Si no hay lat/lng del cliente, geocodifica la dirección
                  if ((clientLat === undefined || clientLng === undefined) && pedido.direccion) {
                    try {
                      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pedido.direccion)}`);
                      const geoData = await geoRes.json();
                      if (geoData && geoData[0]) {
                        clientLat = parseFloat(geoData[0].lat);
                        clientLng = parseFloat(geoData[0].lon);
                      }
                    } catch {}
                  }
                  // Si no se pudo obtener la ubicación del cliente, solo muestra la del repartidor
                  let centerLat = myLat, centerLng = myLng;
                  if (clientLat && clientLng) {
                    centerLat = (myLat + clientLat) / 2;
                    centerLng = (myLng + clientLng) / 2;
                  }
                  const map = new maplibregl.Map({
                    container: 'mapbox-map',
                    style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
                    center: [centerLng, centerLat],
                    zoom: 13,
                  });
                  new maplibregl.Marker({ color: '#2563eb' }).setLngLat([myLng, myLat]).setPopup(new maplibregl.Popup().setText('Tu ubicación')).addTo(map);
                  if (clientLat && clientLng) {
                    new maplibregl.Marker({ color: '#16a34a' }).setLngLat([clientLng, clientLat]).setPopup(new maplibregl.Popup().setText('Cliente')).addTo(map);
                  }
                  setMapInstance(map);
                  setMapPedido(pedido.id);
                }, err => {
                  alert('No se pudo obtener la ubicación del dispositivo.');
                });
              } else {
                alert('Geolocalización no soportada en este navegador.');
              }
            }} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, cursor: 'pointer' }}>
              Ver mapa
            </button>
            <button onClick={() => marcarEntregado(pedido.id)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, cursor: 'pointer' }}>
              Marcar entregado
            </button>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Pedidos por aceptar</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
        {porAceptar.length === 0 && (
          <div style={{ color: '#64748b' }}>No hay pedidos por aceptar.</div>
        )}
        {porAceptar.map(pedido => (
          <div key={pedido.id} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{pedido.cliente_nombre || pedido.cliente || 'Cliente'}</div>
              <div style={{ color: '#2563eb', fontSize: 15 }}>{pedido.direccion}</div>
            </div>
            <button onClick={() => aceptarPedido(pedido.id)} style={{ background: '#f59e42', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, cursor: 'pointer' }}>
              Aceptar pedido
            </button>
          </div>
        ))}
      </div>
      {mapPedido !== null && (
        <div style={{ marginTop: 32 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Ubicación del cliente</h4>
          <div id="mapbox-map"></div>
          <button className="btn-cerrar-mapa" onClick={() => setMapPedido(null)}>
            Cerrar mapa
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeRepartidorPage;
