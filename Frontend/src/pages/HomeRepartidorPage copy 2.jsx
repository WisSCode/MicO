import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/repartidor-home.css';
import { FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MAPTILER_KEY = 'HGPx4i0Pm39GPzeBQ2Q0';

const HomeRepartidorPage = () => {
  // Estados originales
  const [goalLocation, setGoalLocation] = useState(null);

  const [stats, setStats] = useState({ total: 0, entregadas: 0, pendientes: 0 });
  const [pedidos, setPedidos] = useState([]);
  const [mapPedido, setMapPedido] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const navigate = useNavigate();

  // Nuevos estados para mapa ruta
  const [userLocation, setUserLocation] = useState(null); // [lng, lat]
  const [destination, setDestination] = useState(null); // [lng, lat]
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLayerExists = useRef(false);

  // Carga de pedidos y estadísticas
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem('access');
        const res = await axios.get('http://localhost:8000/api/pedidos/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPedidos(res.data);
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

  // Mostrar ubicación actual del repartidor y crear mapa para ruta
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];
        setUserLocation(coords);

        if (!mapRef.current) {
          // Crear mapa solo una vez
          const map = new maplibregl.Map({
            container: 'mapbox-map-repartidor',
            style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
            center: coords,
            zoom: 14,
          });

          mapRef.current = map;

          // Evento para seleccionar meta con clic
          map.on('click', (e) => {
            const coordsClick = [e.lngLat.lng, e.lngLat.lat];
            setDestination(coordsClick);

            // Remover marcador de meta anterior si existía
            if (destinationMarkerRef.current) {
              destinationMarkerRef.current.remove();
            }

            // Agregar marcador de meta
            destinationMarkerRef.current = new maplibregl.Marker({ color: 'red' })
              .setLngLat(coordsClick)
              .addTo(map);
          });
        } else {
          // Si ya hay mapa, solo centramos
          mapRef.current.flyTo({ center: coords, zoom: 14 });
        }

        // Agregar marcador azul para usuario, removiendo el anterior
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }
        userMarkerRef.current = new maplibregl.Marker({ color: 'blue' })
          .setLngLat(coords)
          .addTo(mapRef.current);
      },
      (error) => {
        console.error('No se pudo obtener la ubicación del repartidor', error);
      }
    );
  }, []);

  // Función para iniciar ruta entre userLocation y destination
  const startRoute = async () => {
  if (!userLocation || !destination) {
    alert("Por favor, marca tu ubicación y la meta primero.");
    return;
  }

  const start = `${userLocation[0]},${userLocation[1]}`; // lng,lat
  const end = `${destination[0]},${destination[1]}`;

  const url = `https://api.maptiler.com/routes/v2/driving/${start};${end}?key=${MAPTILER_KEY}&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json();
      console.error("Error en API de rutas:", data);
      alert("No se puede generar la ruta");
      return;
    }
    const data = await response.json();

    const route = data.routes[0]?.geometry;
    if (!route) {
      alert("Ruta no encontrada");
      return;
    }

    // Si ya existe, la removemos
    if (mapRef.current.getSource('route')) {
      mapRef.current.removeLayer('route');
      mapRef.current.removeSource('route');
    }

    mapRef.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: route,
      },
    });

    mapRef.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#1d4ed8',
        'line-width': 5,
      },
    });

  } catch (error) {
    console.error('Error generando la ruta:', error);
    alert('No se pudo generar la ruta.');
    }
  };


  // Función para centrar mapa en la ubicación actual
  const centerToUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({ center: userLocation, zoom: 14 });
    }
  };

  // Resto de funciones originales para pedidos (no modificado)
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

  // Mapa para pedido individual (igual que el original)
  useEffect(() => {
    let cancelled = false;
    const showMap = async () => {
      if (mapPedido !== null) {
        const pedido = pedidos.find(p => p.id === mapPedido);
        if (pedido && !mapInstance) {
          let lat = pedido.lat, lng = pedido.lng;
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
    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [mapPedido]);

  return (
    <div className="repartidor-home" style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
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
        {pedidos.filter(p => p.estado !== 'entregado').length === 0 && (
          <div style={{ color: '#64748b' }}>No tienes pedidos en curso.</div>
        )}
        {pedidos.filter(p => p.estado !== 'entregado').map(pedido => (
          <div key={pedido.id} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{pedido.cliente_nombre || pedido.cliente || 'Cliente'}</div>
              <div style={{ color: '#2563eb', fontSize: 15 }}>{pedido.direccion}</div>
            </div>
            <button
              onClick={() => setMapPedido(pedido.id)}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Ver mapa
            </button>
            <button
              onClick={() => marcarEntregado(pedido.id)}
              style={{
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Marcar entregado
            </button>
          </div>
        ))}
      </div>

      {mapPedido !== null && (
        <div style={{ marginTop: 32 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Ubicación del cliente</h4>
          <div id="mapbox-map" style={{ height: 300, borderRadius: 8 }}></div>
          <button className="btn-cerrar-mapa" onClick={() => setMapPedido(null)}>
            Cerrar mapa
          </button>
        </div>
      )}

      {/* NUEVO MAPA: Ubicación del repartidor y ruta */}
      <div style={{ marginTop: 32 }}>
        <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Tu ubicación actual y ruta</h4>
        <div id="mapbox-map-repartidor" style={{ height: 400, borderRadius: 8 }}></div>

        {/* Botones para centrar ubicación y comenzar ruta */}
        <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <button
            onClick={centerToUser}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Centrar en mi ubicación
          </button>
          <button
            onClick={startRoute}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Iniciar ruta
          </button>
        </div>
        <p style={{ marginTop: 8, color: '#555' }}>
          Haz clic en el mapa para marcar tu destino (meta) antes de iniciar la ruta.
        </p>
      </div>
    </div>
  );
};

export default HomeRepartidorPage;