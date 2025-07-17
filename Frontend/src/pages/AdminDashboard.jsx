import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <StatCard title="Pedidos Hoy" value="1,247" trend="+12.5% vs ayer" />
        <StatCard title="Usuarios Activos" value="8,456" trend="+8.2% este mes" />
        <StatCard title="Repartidores" value="127" additional="89 en línea" />
        <StatCard title="Empresas" value="45" additional="42 activas - 3 pendientes" />
      </div>

      <div className="charts-container">
        <div className="orders-chart">
          <h2>Pedidos por Día</h2>
          <div className="chart-bars">
            <div className="bar" style={{ height: '60%' }}></div>
            <div className="bar" style={{ height: '70%' }}></div>
            <div className="bar" style={{ height: '50%' }}></div>
            <div className="bar" style={{ height: '80%' }}></div>
            <div className="bar" style={{ height: '90%' }}></div>
            <div className="bar" style={{ height: '65%' }}></div>
            <div className="bar" style={{ height: '40%' }}></div>
          </div>
          <div className="chart-labels">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, additional }) => {
  return (
    <div className="stat-card">
      <h3>{value}</h3>
      <p>{title}</p>
      {trend && <span className="trend">{trend}</span>}
      {additional && <span className="additional">{additional}</span>}
    </div>
  );
};

export default AdminDashboard;
