import React, { useEffect, useState } from 'react';
import axios from 'axios';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/repartidor-home.css';
import { FaMapMarkerAlt, FaRoute, FaEye, FaCheck, FaTimes, FaDollarSign, FaPhone, FaCalendarAlt, FaCreditCard, FaBox, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


const MAPTILER_KEY = 'HGPx4i0Pm39GPzeBQ2Q0';

const HomeRepartidorPage = () => {
  const [stats, setStats] = useState({ total: 0, entregadas: 0, pendientes: 0, disponibles: 0 });
  const [pedidos, setPedidos] = useState([]);
  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mapInstances, setMapInstances] = useState({});
  const [repartidorUbicacion, setRepartidorUbicacion] = useState(null);
  const [ubicacionPermiso, setUbicacionPermiso] = useState('pending'); // pending, granted, denied
  const [cargandoMapa, setCargandoMapa] = useState({}); // Para mostrar estado de carga por pedido
  const [actualizandoUbicacion, setActualizandoUbicacion] = useState(false); // Para mostrar cuándo se está actualizando
  const navigate = useNavigate();
  const repartidorId = Number(localStorage.getItem('repartidor_model_id'));

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const res = await axios.get('http://localhost:8000/api/pedidos/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Separar pedidos por estado
        const todosPedidos = res.data;
        const pedidosAsignados = todosPedidos.filter(p => p.repartidor === repartidorId || p.repartidor_id === repartidorId);
        const pedidosLibres = todosPedidos.filter(p => !p.repartidor && !p.repartidor_id && p.estado !== 'entregado');
        
        setPedidos(pedidosAsignados);
        setPedidosDisponibles(pedidosLibres);
        
        const entregadas = pedidosAsignados.filter(p => p.estado === 'entregado').length;
        const pendientes = pedidosAsignados.filter(p => p.estado !== 'entregado').length;
        
        setStats({ 
          total: pedidosAsignados.length, 
          entregadas, 
          pendientes,
          disponibles: pedidosLibres.length 
        });
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        console.error('Status de error:', err.response?.status);
        console.error('Mensaje de error:', err.response?.data);
        
        if (err.response && err.response.status === 401) {
          alert('Sesión expirada o no autorizada. Por favor inicia sesión nuevamente.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          alert('Error al cargar pedidos: ' + (err.response?.data?.detail || err.message));
        }
        setPedidos([]);
        setPedidosDisponibles([]);
        setStats({ total: 0, entregadas: 0, pendientes: 0, disponibles: 0 });
      }
    };
    fetchPedidos();
  }, [repartidorId, navigate]);

  // Función para obtener ubicación actual del repartidor
  const obtenerUbicacionActual = async () => {
    setActualizandoUbicacion(true);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setActualizandoUbicacion(false);
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          const nuevaUbicacion = { lat: latitude, lng: longitude };
          setRepartidorUbicacion(nuevaUbicacion);

          // Enviar ubicación al backend
          try {
            const token = localStorage.getItem('token');
            const ubicacionData = {
              latitud: latitude,
              longitud: longitude
            };
            
            await axios.post('http://localhost:8000/api/ubicacion/', ubicacionData, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (error) {
            // Error al enviar ubicación al backend (no crítico)
          }
          
          setActualizandoUbicacion(false);
          resolve(nuevaUbicacion);
        },
        (error) => {
          setActualizandoUbicacion(false);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 5000 // Máximo 5 segundos de caché
        }
      );
    });
  };

  // Obtener ubicación inicial del repartidor
  useEffect(() => {
    const inicializarUbicacion = async () => {
      try {
        await obtenerUbicacionActual();
        setUbicacionPermiso('granted');
      } catch (error) {
        setUbicacionPermiso('denied');
        
        let errorMsg = 'Error desconocido al obtener ubicación';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Permisos de ubicación denegados por el usuario';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMsg = 'Tiempo agotado al obtener ubicación';
            break;
        }
        
        alert(`${errorMsg}. Algunas funciones pueden no estar disponibles.`);
      }
    };

    if (ubicacionPermiso === 'pending') {
      inicializarUbicacion();
    }
  }, [ubicacionPermiso]);

  // Actualizar ubicación cada 10 segundos
  useEffect(() => {
    let intervalId;
    
    if (ubicacionPermiso === 'granted') {
      intervalId = setInterval(async () => {
        try {
          const nuevaUbicacion = await obtenerUbicacionActual();
          
          // Actualizar todos los mapas existentes con la nueva ubicación
          actualizarMapasConNuevaUbicacion(nuevaUbicacion);
        } catch (error) {
          // Error en actualización automática de ubicación
        }
      }, 10000); // 10 segundos
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ubicacionPermiso]);

  // Función para actualizar todos los mapas con nueva ubicación del repartidor
  const actualizarMapasConNuevaUbicacion = (nuevaUbicacion) => {
    Object.entries(mapInstances).forEach(([pedidoId, mapInstance]) => {
      if (mapInstance && nuevaUbicacion) {
        try {
          // Encontrar el pedido correspondiente
          const pedido = pedidos.find(p => p.id === parseInt(pedidoId));
          if (!pedido) return;

          // Obtener coordenadas del cliente
          let clientLat = pedido.direccion_latitud;
          let clientLng = pedido.direccion_longitud;
          
          if (typeof clientLat === 'string') clientLat = parseFloat(clientLat);
          if (typeof clientLng === 'string') clientLng = parseFloat(clientLng);
          
          if (!clientLat || !clientLng || isNaN(clientLat) || isNaN(clientLng)) {
            return; // Skip si no hay coordenadas válidas del cliente
          }

          // Actualizar vista del mapa para incluir ambos puntos
          const bounds = new maplibregl.LngLatBounds()
            .extend([nuevaUbicacion.lng, nuevaUbicacion.lat])
            .extend([clientLng, clientLat]);
          
          mapInstance.fitBounds(bounds, { 
            padding: 80, 
            maxZoom: 16,
            duration: 1000 // Animación suave de 1 segundo
          });

          // Buscar y actualizar el marcador del repartidor existente
          const marcadores = mapInstance._markers || [];
          marcadores.forEach(marker => {
            // Verificar si es el marcador del repartidor (color azul)
            if (marker._color === '#2563eb') {
              marker.setLngLat([nuevaUbicacion.lng, nuevaUbicacion.lat]);
              
              // Actualizar popup del repartidor
              const distancia = calcularDistancia(
                nuevaUbicacion.lat, nuevaUbicacion.lng,
                clientLat, clientLng
              );
              
              marker.setPopup(new maplibregl.Popup().setHTML(`
                <div style="padding: 8px;">
                  <strong>🚚 Tu ubicación (GPS)</strong><br>
                  <small>Actualizada: ${new Date().toLocaleTimeString()}<br>
                  Distancia: ${distancia.toFixed(2)} km<br>
                  Lat: ${nuevaUbicacion.lat.toFixed(6)}<br>
                  Lng: ${nuevaUbicacion.lng.toFixed(6)}</small>
                </div>
              `));
            }
          });

          // Actualizar ruta si existe
          if (mapInstance.getSource('route')) {
            // Remover ruta existente
            mapInstance.removeLayer('route');
            mapInstance.removeSource('route');
            
            // Obtener nueva ruta
            obtenerYActualizarRuta(mapInstance, nuevaUbicacion, clientLat, clientLng);
          }

          console.log(`✅ Mapa actualizado para pedido ${pedidoId}`);
        } catch (error) {
          console.error(`❌ Error al actualizar mapa ${pedidoId}:`, error);
        }
      }
    });
  };

  // Función auxiliar para obtener y actualizar ruta
  const obtenerYActualizarRuta = async (mapInstance, repartidorUbicacion, clientLat, clientLng) => {
    try {
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${repartidorUbicacion.lng},${repartidorUbicacion.lat};${clientLng},${clientLat}?geometries=geojson&overview=full`;
      
      const routeRes = await fetch(routeUrl);
      
      if (routeRes.ok) {
        const routeData = await routeRes.json();
        
        if (routeData.routes && routeData.routes[0]) {
          const route = routeData.routes[0];
          
          mapInstance.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });

          mapInstance.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 
              'line-color': '#3b82f6', 
              'line-width': 5,
              'line-opacity': 0.8
            }
          });
        }
      } else {
        // Fallback: línea directa
        agregarLineaDirectaAMapa(mapInstance, repartidorUbicacion, clientLat, clientLng);
      }
    } catch (error) {
      // Fallback: línea directa
      agregarLineaDirectaAMapa(mapInstance, repartidorUbicacion, clientLat, clientLng);
    }
  };

  // Función auxiliar para agregar línea directa a un mapa específico
  const agregarLineaDirectaAMapa = (mapInstance, repartidorUbicacion, clientLat, clientLng) => {
    try {
      const directRoute = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [repartidorUbicacion.lng, repartidorUbicacion.lat],
            [clientLng, clientLat]
          ]
        }
      };
      
      mapInstance.addSource('route', {
        type: 'geojson',
        data: directRoute
      });

      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 
          'line-color': '#ef4444', 
          'line-width': 4,
          'line-dasharray': [3, 3],
          'line-opacity': 0.7
        }
      });
    } catch (error) {
      console.error('❌ Error al agregar línea directa:', error);
    }
  };

  // Función para crear mapa con ruta usando ubicaciones reales de la base de datos
  const crearMapaConRuta = async (pedidoId, contenedorId) => {
    console.log('=== 🗺️ INICIANDO CREACIÓN DE MAPA CON DATOS REALES ===');
    console.log('📦 Pedido ID:', pedidoId);
    console.log('📋 Contenedor ID:', contenedorId);
    
    // Marcar como cargando
    setCargandoMapa(prev => ({ ...prev, [pedidoId]: true }));
    
    // Verificar ubicación del repartidor
    if (!repartidorUbicacion) {
      console.error('❌ Ubicación del repartidor no disponible');
      alert('Ubicación del repartidor no disponible. Por favor, permite el acceso a tu ubicación.');
      setCargandoMapa(prev => ({ ...prev, [pedidoId]: false }));
      return;
    }

    console.log('✅ Ubicación actual del repartidor:', repartidorUbicacion);

    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      console.error('❌ Pedido no encontrado para ID:', pedidoId);
      setCargandoMapa(prev => ({ ...prev, [pedidoId]: false }));
      return;
    }

    console.log('📦 Datos del pedido encontrado:', {
      id: pedido.id,
      cliente: pedido.cliente_nombre,
      direccion: pedido.direccion_completa,
      direccion_latitud: pedido.direccion_latitud,
      direccion_longitud: pedido.direccion_longitud,
      estado: pedido.estado
    });

    // Obtener coordenadas del cliente desde la base de datos
    let clientLat = pedido.direccion_latitud;
    let clientLng = pedido.direccion_longitud;
    
    // Convertir a números si son strings
    if (typeof clientLat === 'string') clientLat = parseFloat(clientLat);
    if (typeof clientLng === 'string') clientLng = parseFloat(clientLng);
    
    console.log('🔄 Coordenadas del cliente procesadas:', {
      lat: clientLat,
      lng: clientLng,
      isValidLat: clientLat && !isNaN(clientLat) && isFinite(clientLat),
      isValidLng: clientLng && !isNaN(clientLng) && isFinite(clientLng)
    });
    
    // Si no hay coordenadas válidas del cliente en la BD, intentar geocodificar
    if (!clientLat || !clientLng || isNaN(clientLat) || isNaN(clientLng) || 
        !isFinite(clientLat) || !isFinite(clientLng)) {
      
      if (pedido.direccion_completa) {
        console.log('🔍 Geocodificando dirección:', pedido.direccion_completa);
        try {
          const geocodeServices = [
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pedido.direccion_completa + ', Panamá')}&limit=1&countrycodes=pa`,
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pedido.direccion_completa)}&limit=1`,
            `https://photon.komoot.io/api/?q=${encodeURIComponent(pedido.direccion_completa + ', Panamá')}&limit=1`
          ];
          
          for (let i = 0; i < geocodeServices.length; i++) {
            try {
              const geoRes = await fetch(geocodeServices[i]);
              const geoData = await geoRes.json();
              
              if (geoData && geoData.length > 0) {
                const result = geoData[0];
                if (result.lat && result.lon) {
                  clientLat = parseFloat(result.lat);
                  clientLng = parseFloat(result.lon);
                } else if (result.geometry?.coordinates) {
                  clientLng = parseFloat(result.geometry.coordinates[0]);
                  clientLat = parseFloat(result.geometry.coordinates[1]);
                }
                
                if (clientLat && clientLng && !isNaN(clientLat) && !isNaN(clientLng)) {
                  console.log(`✅ Coordenadas geocodificadas:`, { lat: clientLat, lng: clientLng });
                  break;
                }
              }
            } catch (serviceError) {
              console.warn(`⚠️ Error en servicio ${i + 1}:`, serviceError);
            }
          }
        } catch (error) {
          console.error('❌ Error al geocodificar:', error);
        }
      }
      
      // Si aún no hay coordenadas válidas, mostrar error
      if (!clientLat || !clientLng || isNaN(clientLat) || isNaN(clientLng)) {
        console.error('❌ No se pudieron obtener coordenadas válidas del cliente');
        alert(`No se pudo obtener la ubicación del cliente para el pedido #${pedidoId}. Verifica que la dirección sea válida en la base de datos.`);
        setCargandoMapa(prev => ({ ...prev, [pedidoId]: false }));
        return;
      }
    }

    // Validar coordenadas del repartidor 
    if (!repartidorUbicacion.lat || !repartidorUbicacion.lng || 
        isNaN(repartidorUbicacion.lat) || isNaN(repartidorUbicacion.lng) ||
        !isFinite(repartidorUbicacion.lat) || !isFinite(repartidorUbicacion.lng)) {
      console.error('❌ Coordenadas del repartidor inválidas:', repartidorUbicacion);
      alert('Ubicación del repartidor no válida. Refrescando ubicación...');
      try {
        await obtenerUbicacionActual();
      } catch (error) {
        setCargandoMapa(prev => ({ ...prev, [pedidoId]: false }));
        return;
      }
    }

    // Limpiar mapa anterior si existe
    if (mapInstances[pedidoId]) {
      console.log('🧹 Limpiando mapa anterior');
      mapInstances[pedidoId].remove();
    }

    // Verificar que el contenedor existe
    const container = document.getElementById(contenedorId);
    if (!container) {
      console.error('❌ Contenedor del mapa no encontrado:', contenedorId);
      setCargandoMapa(prev => ({ ...prev, [pedidoId]: false }));
      return;
    }

    // Coordenadas finales validadas
    console.log('📍 COORDENADAS FINALES VALIDADAS:');
    console.log('🚚 Repartidor (GPS actual):', { lat: repartidorUbicacion.lat, lng: repartidorUbicacion.lng });
    console.log('🏠 Cliente (Base de datos):', { lat: clientLat, lng: clientLng });

    // Calcular centro y crear mapa
    const centerLng = (repartidorUbicacion.lng + clientLng) / 2;
    const centerLat = (repartidorUbicacion.lat + clientLat) / 2;
    
    console.log('🎯 Centro del mapa:', { lat: centerLat, lng: centerLng });

    let map;
    try {
      map = new maplibregl.Map({
        container: contenedorId,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
        center: [centerLng, centerLat],
        zoom: 12,
        attributionControl: false
      });

      console.log('✅ Mapa creado exitosamente');
      
      // Manejar errores de imágenes faltantes
      map.on('styleimagemissing', (e) => {
        const size = 50;
        const img = new Uint8Array(size * size * 4);
        for (let i = 0; i < img.length; i += 4) {
          img[i] = 255; img[i + 1] = 0; img[i + 2] = 0; img[i + 3] = 255;
        }
        map.addImage(e.id, { width: size, height: size, data: img });
      });
      
      map.on('load', () => {
        console.log('🗺️ Mapa cargado, ajustando vista...');
        
        // Crear bounds que incluyan ambos puntos
        const bounds = new maplibregl.LngLatBounds()
          .extend([repartidorUbicacion.lng, repartidorUbicacion.lat])
          .extend([clientLng, clientLat]);
        
        map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
      });
      
    } catch (mapError) {
      console.error('❌ Error al crear el mapa:', mapError);
      alert('Error al crear el mapa: ' + mapError.message);
      setCargandoMapa(prev => ({ ...prev, [pedidoId]: false }));
      return;
    }

    // Agregar marcadores
    try {
      console.log('📍 Agregando marcadores...');
      
      // Marcador del repartidor (azul) - ubicación GPS actual
      const repartidorMarker = new maplibregl.Marker({ 
        color: '#2563eb',
        scale: 1.2
      })
        .setLngLat([repartidorUbicacion.lng, repartidorUbicacion.lat])
        .setPopup(new maplibregl.Popup().setHTML(`
          <div style="padding: 8px;">
            <strong>🚚 Tu ubicación (GPS)</strong><br>
            <small>Actualizada automáticamente<br>
            Lat: ${repartidorUbicacion.lat.toFixed(6)}<br>
            Lng: ${repartidorUbicacion.lng.toFixed(6)}</small>
          </div>
        `))
        .addTo(map);

      // Calcular distancia real
      const distancia = calcularDistancia(
        repartidorUbicacion.lat, repartidorUbicacion.lng,
        clientLat, clientLng
      );
      
      // Marcador del cliente (verde) - ubicación de la base de datos
      const clienteMarker = new maplibregl.Marker({ 
        color: '#16a34a',
        scale: 1.2
      })
        .setLngLat([clientLng, clientLat])
        .setPopup(new maplibregl.Popup().setHTML(`
          <div style="padding: 8px;">
            <strong>🏠 ${pedido.cliente_nombre || 'Cliente'}</strong><br>
            <small>${pedido.direccion_completa || 'Dirección no especificada'}<br>
            Distancia: ${distancia.toFixed(2)} km<br>
            Lat: ${clientLat.toFixed(6)}<br>
            Lng: ${clientLng.toFixed(6)}</small>
          </div>
        `))
        .addTo(map);

      console.log('✅ Marcadores agregados');
      console.log(`📏 Distancia calculada: ${distancia.toFixed(2)} km`);
    } catch (markerError) {
      console.error('❌ Error al agregar marcadores:', markerError);
    }

    // Obtener ruta real usando OSRM
    try {
      console.log('🛣️ Obteniendo ruta real...');
      
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${repartidorUbicacion.lng},${repartidorUbicacion.lat};${clientLng},${clientLat}?geometries=geojson&overview=full`;
      
      const routeRes = await fetch(routeUrl);
      
      if (routeRes.ok) {
        const routeData = await routeRes.json();
        
        if (routeData.routes && routeData.routes[0]) {
          const route = routeData.routes[0];
          console.log(`🛣️ Ruta obtenida - Distancia: ${(route.distance / 1000).toFixed(2)}km, Duración: ${Math.round(route.duration / 60)}min`);
          
          if (map.loaded()) {
            agregarRutaAlMapa(map, route);
          } else {
            map.on('load', () => agregarRutaAlMapa(map, route));
          }
        } else {
          throw new Error('No routes found');
        }
      } else {
        throw new Error(`OSRM API error: ${routeRes.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Error al obtener ruta, usando línea directa:', error);
      
      if (map.loaded()) {
        agregarLineaDirecta(map, repartidorUbicacion, clientLat, clientLng);
      } else {
        map.on('load', () => agregarLineaDirecta(map, repartidorUbicacion, clientLat, clientLng));
      }
    }

    // Función helper para agregar ruta al mapa
    function agregarRutaAlMapa(map, route) {
      try {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 
            'line-color': '#3b82f6', 
            'line-width': 5,
            'line-opacity': 0.8
          }
        });
        
        console.log('✅ Ruta real agregada al mapa');
      } catch (layerError) {
        console.error('❌ Error al agregar capa de ruta:', layerError);
      }
    }

    // Función helper para agregar línea directa
    function agregarLineaDirecta(map, repartidorUbicacion, clientLat, clientLng) {
      try {
        const directRoute = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [repartidorUbicacion.lng, repartidorUbicacion.lat],
              [clientLng, clientLat]
            ]
          }
        };
        
        map.addSource('route', {
          type: 'geojson',
          data: directRoute
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 
            'line-color': '#ef4444', 
            'line-width': 4,
            'line-dasharray': [3, 3],
            'line-opacity': 0.7
          }
        });
        
        console.log('✅ Línea directa agregada como fallback');
      } catch (fallbackError) {
        console.error('❌ Error al agregar línea directa:', fallbackError);
      }
    }

    // Guardar instancia del mapa y marcar como terminado
    setMapInstances(prev => ({ ...prev, [pedidoId]: map }));
    setCargandoMapa(prev => ({ ...prev, [pedidoId]: false }));
    
    console.log('🎉 Mapa creado completamente con datos reales para pedido', pedidoId);
  };

  // Función auxiliar para calcular distancia entre dos puntos (fórmula de Haversine)
  const calcularDistancia = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Función para ver detalles del pedido
  const verDetallesPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
  };

  // Función para aceptar pedido
  const aceptarPedido = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://localhost:8000/api/pedidos/${id}/`, 
        { repartidor_id: repartidorId, estado: 'enviado' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar estados
      setPedidosDisponibles(prev => prev.filter(p => p.id !== id));
      setPedidos(prev => [...prev, res.data]);
      setPedidoSeleccionado(null);
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pendientes: prev.pendientes + 1,
        disponibles: prev.disponibles - 1
      }));
      
      alert('Pedido aceptado exitosamente');
    } catch (err) {
      console.error('Error al aceptar pedido:', err);
      alert('No se pudo aceptar el pedido.');
    }
  };

  // Función para marcar pedido como entregado
  const marcarEntregado = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/pedidos/${id}/`, 
        { estado: 'entregado', repartidor_id: repartidorId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPedidos(pedidos => pedidos.map(p => 
        p.id === id ? { ...p, estado: 'entregado', repartidor: repartidorId } : p
      ));
      
      setStats(s => ({ 
        ...s, 
        entregadas: s.entregadas + 1, 
        pendientes: Math.max(s.pendientes - 1, 0) 
      }));
      
      // Limpiar mapa si existe
      if (mapInstances[id]) {
        mapInstances[id].remove();
        setMapInstances(prev => {
          const { [id]: removed, ...rest } = prev;
          return rest;
        });
      }
    } catch (err) { 
      console.error('Error al marcar como entregado:', err);
      alert('No se pudo marcar como entregado.');
    }
  };

  return (
    <div className="repartidor-home" style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Panel de Repartidor</h2>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#e0f2fe', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.total}</div>
          <div>Total de entregas</div>
        </div>
        <div style={{ background: '#bbf7d0', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.entregadas}</div>
          <div>Entregadas</div>
        </div>
        <div style={{ background: '#fee2e2', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.pendientes}</div>
          <div>En proceso</div>
        </div>
        <div style={{ background: '#fef3c7', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.disponibles}</div>
          <div>Disponibles</div>
        </div>
      </div>

      {/* ...existing code... */}

      {ubicacionPermiso === 'denied' && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: 8, 
          marginBottom: 24,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}>
          <FaMapMarkerAlt /> Permisos de ubicación denegados. Algunas funciones pueden no estar disponibles.
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: 12,
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Recargar página
          </button>
        </div>
      )}

      {ubicacionPermiso === 'pending' && (
        <div style={{ 
          background: '#fef3c7', 
          color: '#d97706', 
          padding: '1rem', 
          borderRadius: 8, 
          marginBottom: 24,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}>
          <FaMapMarkerAlt /> Obteniendo ubicación...
        </div>
      )}

      {/* ...existing code... */}

      {/* Pedidos disponibles para aceptar */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaMapMarkerAlt /> Pedidos disponibles ({stats.disponibles})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pedidosDisponibles.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              No hay pedidos disponibles para aceptar.
            </div>
          ) : (
            pedidosDisponibles.map(pedido => (
              <div key={pedido.id} style={{ 
                background: '#fff', 
                borderRadius: 10, 
                boxShadow: '0 2px 8px #0001', 
                padding: 16, 
                border: '2px solid #fbbf24'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {pedido.cliente_nombre || pedido.cliente_nombre_usuario || 'Cliente sin nombre'}
                    </div>
                    <div style={{ color: '#2563eb', fontSize: '0.9rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FaMapMarkerAlt size={12} /> {pedido.direccion_completa || pedido.direccion_nombre || 'Dirección no especificada'}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.85rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FaDollarSign size={12} /> Total: ${pedido.total || '0.00'}
                    </div>
                    {pedido.cliente_telefono && (
                      <div style={{ color: '#666', fontSize: '0.85rem', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaPhone size={12} /> {pedido.cliente_telefono}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => verDetallesPedido(pedido)}
                      style={{ 
                        background: '#6366f1', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '8px 12px', 
                        fontWeight: 500, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <FaEye /> Detalles
                    </button>
                    <button 
                      onClick={() => aceptarPedido(pedido.id)}
                      style={{ 
                        background: '#16a34a', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '8px 12px', 
                        fontWeight: 500, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <FaCheck /> Aceptar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pedidos en curso */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaRoute /> Pedidos en curso ({stats.pendientes})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {pedidos.filter(p => p.estado !== 'entregado').length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              No tienes pedidos en curso.
            </div>
          ) : (
            pedidos.filter(p => p.estado !== 'entregado').map(pedido => (
              <div key={pedido.id}>
                <div style={{ 
                  background: '#fff', 
                  borderRadius: 10, 
                  boxShadow: '0 2px 8px #0001', 
                  padding: 16,
                  border: '2px solid #16a34a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {pedido.cliente_nombre || pedido.cliente_nombre_usuario || 'Cliente sin nombre'}
                      </div>
                      <div style={{ color: '#2563eb', fontSize: '0.9rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaMapMarkerAlt size={12} /> {pedido.direccion_completa || pedido.direccion_nombre || 'Dirección no especificada'}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.85rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaDollarSign size={12} /> Total: ${pedido.total || '0.00'}
                        <span style={{ margin: '0 8px' }}>|</span>
                        <FaBox size={12} /> Estado: <span style={{ color: '#f97316', fontWeight: 600 }}>{pedido.estado}</span>
                      </div>
                      {pedido.cliente_telefono && (
                        <div style={{ color: '#666', fontSize: '0.85rem', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FaPhone size={12} /> {pedido.cliente_telefono}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => crearMapaConRuta(pedido.id, `map-${pedido.id}`)}
                        disabled={ubicacionPermiso !== 'granted' || cargandoMapa[pedido.id]}
                        style={{ 
                          background: ubicacionPermiso === 'granted' && !cargandoMapa[pedido.id] ? '#2563eb' : '#9ca3af', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 6, 
                          padding: '8px 12px', 
                          fontWeight: 500, 
                          cursor: ubicacionPermiso === 'granted' && !cargandoMapa[pedido.id] ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          opacity: cargandoMapa[pedido.id] ? 0.7 : 1
                        }}
                      >
                        <FaRoute /> {cargandoMapa[pedido.id] ? 'Cargando...' : 'Ver ruta'}
                      </button>
                      <button 
                        onClick={() => marcarEntregado(pedido.id)} 
                        style={{ 
                          background: '#16a34a', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 6, 
                          padding: '8px 12px', 
                          fontWeight: 500, 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <FaCheck /> Entregado
                      </button>
                    </div>
                  </div>
                  
                  {/* Mapa individual para cada pedido */}
                  <div 
                    id={`map-${pedido.id}`} 
                    style={{ 
                      height: 300, 
                      borderRadius: 8, 
                      border: '1px solid #e5e7eb',
                      display: mapInstances[pedido.id] ? 'block' : 'none'
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de detalles del pedido */}
      {pedidoSeleccionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 550,
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: 700,
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <FaEye color="#6366f1" /> Detalles del Pedido
              </h3>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e5e7eb';
                  e.target.style.color = '#374151';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.color = '#6b7280';
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: '0.5rem',
                  color: '#1e40af',
                  fontWeight: 600
                }}>
                  <FaUser size={16} /> Cliente
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>
                  {pedidoSeleccionado.cliente_nombre || pedidoSeleccionado.cliente_nombre_usuario || 'No especificado'}
                </div>
                {pedidoSeleccionado.cliente_telefono && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6,
                    color: '#6b7280'
                  }}>
                    <FaPhone size={12} /> {pedidoSeleccionado.cliente_telefono}
                  </div>
                )}
              </div>

              <div style={{ 
                background: '#f0f9ff', 
                padding: '1rem', 
                borderRadius: 12,
                border: '1px solid #bae6fd'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: '0.5rem',
                  color: '#0369a1',
                  fontWeight: 600
                }}>
                  <FaMapMarkerAlt size={16} /> Dirección de Entrega
                </div>
                <div style={{ fontSize: '1rem', color: '#1f2937', lineHeight: 1.5 }}>
                  {pedidoSeleccionado.direccion_completa || pedidoSeleccionado.direccion_nombre || 'No especificada'}
                </div>
                {pedidoSeleccionado.direccion_referencia && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#e0f2fe',
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    color: '#0369a1'
                  }}>
                    <strong>Referencia:</strong> {pedidoSeleccionado.direccion_referencia}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ 
                  background: '#f0fdf4', 
                  padding: '1rem', 
                  borderRadius: 12,
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: '0.5rem',
                    color: '#15803d',
                    fontWeight: 600
                  }}>
                    <FaDollarSign size={16} /> Total
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>
                    ${pedidoSeleccionado.total || '0.00'}
                  </div>
                </div>

                <div style={{ 
                  background: '#fefce8', 
                  padding: '1rem', 
                  borderRadius: 12,
                  border: '1px solid #fde047'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: '0.5rem',
                    color: '#a16207',
                    fontWeight: 600
                  }}>
                    <FaCreditCard size={16} /> Pago
                  </div>
                  <div style={{ fontSize: '1rem', color: '#a16207', fontWeight: 600 }}>
                    {pedidoSeleccionado.metodo_pago || 'No especificado'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ 
                  background: '#fef3c7', 
                  padding: '1rem', 
                  borderRadius: 12,
                  border: '1px solid #fbbf24'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: '0.5rem',
                    color: '#d97706',
                    fontWeight: 600
                  }}>
                    <FaBox size={16} /> Estado
                  </div>
                  <div style={{ fontSize: '1rem', color: '#d97706', fontWeight: 600, textTransform: 'capitalize' }}>
                    {pedidoSeleccionado.estado || 'pendiente'}
                  </div>
                </div>

                {pedidoSeleccionado.fecha_pedido && (
                  <div style={{ 
                    background: '#f3f4f6', 
                    padding: '1rem', 
                    borderRadius: 12,
                    border: '1px solid #d1d5db'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      marginBottom: '0.5rem',
                      color: '#6b7280',
                      fontWeight: 600
                    }}>
                      <FaCalendarAlt size={16} /> Fecha
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      {new Date(pedidoSeleccionado.fecha_pedido).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {pedidoSeleccionado.items && pedidoSeleccionado.items.length > 0 && (
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '1rem', 
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: '1rem',
                    color: '#1e40af',
                    fontWeight: 600
                  }}>
                    <FaBox size={16} /> Productos ({pedidoSeleccionado.items.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pedidoSeleccionado.items.map((item, index) => (
                      <div key={index} style={{ 
                        background: '#fff',
                        padding: '0.75rem',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>
                            {item.producto_nombre || item.nombre || item.producto}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                            Cantidad: {item.cantidad}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, color: '#15803d' }}>
                          ${item.total || (item.precio_unitario * item.cantidad) || '0.00'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => {
                  aceptarPedido(pedidoSeleccionado.id);
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 20px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <FaCheck /> Aceptar Pedido
              </button>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 20px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#4b5563'}
                onMouseOut={(e) => e.target.style.background = '#6b7280'}
              >
                <FaTimes /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeRepartidorPage;