import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import '../styles/ubicacion.css';

const UbicacionPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const [coordenadas, setCoordenadas] = useState(null);
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');
  const [error, setError] = useState('');
  const [direccionConfirmada, setDireccionConfirmada] = useState(null);

  const obtenerUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordenadas({ lat: latitude, lng: longitude });
        setInputLat(latitude.toString());
        setInputLng(longitude.toString());
        setError('');
      },
      () => {
        setError('No se pudo obtener la ubicación actual.');
      }
    );
  };

  const validarCoordenadas = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);

    if (
      isNaN(lat) || isNaN(lng) ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) {
      setError('Las coordenadas ingresadas no son válidas.');
      return null;
    }

    return { lat, lng };
  };

  const mostrarUbicacionIngresada = () => {
    const coords = validarCoordenadas();
    if (coords) {
      setCoordenadas(coords);
      setError('');
    }
  };

  const usarComoDireccion = () => {
    if (coordenadas) {
      setDireccionConfirmada(coordenadas);
      console.log('Dirección confirmada:', coordenadas); // Aquí podrías guardar en una API o estado global
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (!coordenadas || !mapRef.current) return;

    const { lat, lng } = coordenadas;

    if (!mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=HGPx4i0Pm39GPzeBQ2Q0`,
        center: [lng, lat],
        zoom: 14,
      });

      markerRef.current = new maplibregl.Marker().setLngLat([lng, lat]).addTo(mapInstance.current);
    } else {
      mapInstance.current.setCenter([lng, lat]);
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [coordenadas]);

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center' }}>Tu Ubicación</h2>

      {coordenadas && (
        <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Latitud: {coordenadas.lat.toFixed(6)} | Longitud: {coordenadas.lng.toFixed(6)}
        </p>
      )}

      {direccionConfirmada && (
        <p style={{ textAlign: 'center', color: 'green', fontWeight: 'bold' }}>
          Dirección confirmada: {direccionConfirmada.lat.toFixed(6)}, {direccionConfirmada.lng.toFixed(6)}
        </p>
      )}

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
        <button onClick={obtenerUbicacion}>Obtener posición actual</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Latitud"
          value={inputLat}
          onChange={(e) => setInputLat(e.target.value)}
        />
        <input
          type="text"
          placeholder="Longitud"
          value={inputLng}
          onChange={(e) => setInputLng(e.target.value)}
        />
        <button onClick={mostrarUbicacionIngresada}>Ver ubicación ingresada</button>
        <button onClick={usarComoDireccion} disabled={!coordenadas}>Usar como dirección de mi pedido</button>
      </div>

      <div
        ref={mapRef}
        style={{ height: '500px', width: '100%', marginTop: '1rem', borderRadius: '10px' }}
      />
    </div>
  );
};

export default UbicacionPage;
