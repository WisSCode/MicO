import React from 'react';
import { FaMotorcycle, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'; // Importar iconos
import './Repartidor.css'; // Importar estilos

function Repartidor() {
  // Datos simulados para los repartidores
  const driversData = [
    {
      id: 'DR001',
      name: 'Carlos Ruiz',
      status: 'En línea',
      deliveries: 89,
      phone: '+57 300 123 4567',
      location: 'Zona Norte',
      iconBgColor: '#A7F3D0', // Color de fondo para el icono de moto
      statusDotColor: '#4CAF50', // Color del punto de estado
      vehicle: 'Moto', // Added vehicle for display
    },
    {
      id: 'DR002',
      name: 'María López',
      status: 'Ocupado',
      deliveries: 156,
      phone: '+57 301 234 5678',
      location: 'Centro',
      iconBgColor: '#FDD8B0',
      statusDotColor: '#FF9800',
      vehicle: 'Moto',
    },
    {
      id: 'DR003',
      name: 'Juan Pérez',
      status: 'Desconectado',
      deliveries: 67,
      phone: '+57 302 345 6789',
      location: 'Zona Sur',
      iconBgColor: '#E2E8F0',
      statusDotColor: '#9E9E9E',
      vehicle: 'Bicicleta',
    },
  ];

  return (
    <div className="app-container"> {/* Contenedor principal para toda la interfaz */}
      <header className="app-header">
        <h1 className="app-title">Gestión de Repartidores</h1>
        <div className="header-actions">
          <select className="status-filter">
            <option value="all">Todos los estados</option>
            <option value="online">En línea</option>
            <option value="busy">Ocupado</option>
            <option value="disconnected">Desconectado</option>
          </select>
          <button className="new-driver-button">
            <span className="plus-icon">+</span> Nuevo Repartidor
          </button>
        </div>
      </header>

      <div className="driver-cards-container">
        {driversData.map((driver) => (
          // Cada tarjeta de repartidor se renderiza aquí
          <div className="driver-card" key={driver.id}>
            <div className="card-header">
              <div className="motorcycle-icon-background" style={{ backgroundColor: driver.iconBgColor }}>
                <FaMotorcycle className="motorcycle-icon" />
              </div>
              <div className="driver-info">
                <h3 className="driver-name">{driver.name}</h3>
                <span className="driver-id">ID: #{driver.id}</span>
              </div>
              <div className="driver-status">
                <span className="status-dot" style={{ backgroundColor: driver.statusDotColor }}></span>
                <span className="status-text">{driver.status}</span>
              </div>
            </div>
            <div className="card-body">
              <div className="stats-row">
                <div className="stat-box deliveries">
                  <span className="stat-value">{driver.deliveries}</span>
                  <span className="stat-label">Entregas</span>
                </div>

              </div>
              <div className="contact-info">
                <p><FaPhone className="icon" /> {driver.phone}</p>
                <p><FaMotorcycle className="icon" /> {driver.vehicle}</p> {/* Changed icon for vehicle type */}
                <p><FaMapMarkerAlt className="icon" /> {driver.location}</p>
              </div>
            </div>
            <div className="card-actions">
              {/* The "Ubicación" button has been removed */}
              <button className="edit-button">Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Repartidor;
