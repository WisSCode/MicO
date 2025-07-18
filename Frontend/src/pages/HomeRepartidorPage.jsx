import React, { useEffect, useState } from 'react';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/repartidor-home.css';

const MAPTILER_KEY = 'HGPx4i0Pm39GPzeBQ2Q0';

const HomeRepartidorPage = () => {
  const [stats, setStats] = useState({ total: 0, entregadas: 0, pendientes: 0 });
  const [pedidos, setPedidos] = useState([]);
  const [mapPedido, setMapPedido] = useState(null); // id del pedido a mostrar en mapa
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem('access');
        const res = await axios.get('http://localhost:8000/api/pedidos/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPedidos(res.data);
        // Estadísticas básicas
        const entregadas = res.data.filter(p => p.estado === 'entregado').length;
        const pendientes = res.data.filter(p => p.estado !== 'entregado').length;
        setStats({ total: res.data.length, entregadas, pendientes });
      } catch (err) {
        setPedidos([]);
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
      const token = localStorage.getItem('access');
      await axios.patch(`http://localhost:8000/api/pedidos/${id}/`, { estado: 'entregado' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(pedidos => pedidos.map(p => p.id === id ? { ...p, estado: 'entregado' } : p));
      setStats(s => ({ ...s, entregadas: s.entregadas + 1, pendientes: s.pendientes - 1 }));
    } catch {}
  };

  return (
    <div className="repartidor-home" style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>Panel de Repartidor</h2>
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
        {pedidos.filter(p => p.estado !== 'entregado').length === 0 && (
          <div style={{ color: '#64748b' }}>No tienes pedidos en curso.</div>
        )}
        {pedidos.filter(p => p.estado !== 'entregado').map(pedido => (
          <div key={pedido.id} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{pedido.cliente_nombre || pedido.cliente || 'Cliente'}</div>
              <div style={{ color: '#2563eb', fontSize: 15 }}>{pedido.direccion}</div>
            </div>
            <button onClick={() => setMapPedido(pedido.id)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, cursor: 'pointer' }}>
              Ver mapa
            </button>
            <button onClick={() => marcarEntregado(pedido.id)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 500, cursor: 'pointer' }}>
              Marcar entregado
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
