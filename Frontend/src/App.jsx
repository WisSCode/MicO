import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HomeUser from './pages/HomeUser';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GestionUser from'./pages/GestionUser';
import GestionEmpresas from './pages/GestionEmpresas';
import AdminDashboard from './pages/AdminDashboard'; 
import Repartidor from './pages/Repartidor';
import './styles/main.css';

function App() {
  return (
    <Router>
     
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/homeuser" element={<HomeUser />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/gestionuser" element={<GestionUser />} />
          <Route path="/gestionempresas" element={<GestionEmpresas />} />
          <Route path="/repartidor" element={<Repartidor />} />
        </Routes>
      </main>
      
    </Router>
  );
}

export default App;