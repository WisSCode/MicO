import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import HomeUser from './pages/HomeUser';
import HomeRepartidorPage from './pages/HomeRepartidorPage';
import HomeEmpresaPage from './pages/HomeEmpresaPage';
import ProductosEmpresaPage from './pages/ProductosEmpresaPage';
import EmpresaConfigPage from './pages/EmpresaConfigPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './styles/main.css';

function App() {
  return (
    <Router>
     
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/homeuser" element={
            <PrivateRoute>
              <HomeUser />
            </PrivateRoute>
          } />
          <Route path="/homeRepartidor" element={
            <PrivateRoute>
              <HomeRepartidorPage />
            </PrivateRoute>
          } />
          <Route path="/:empresaNombre/home" element={
            <PrivateRoute>
              <HomeEmpresaPage />
            </PrivateRoute>
          } />
          <Route path="/:empresaNombre/config" element={
            <PrivateRoute>
              <EmpresaConfigPage />
            </PrivateRoute>
          } />
          <Route path="/:empresaNombre/productos" element={
            <PrivateRoute>
              <ProductosEmpresaPage />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      
    </Router>
  );
}

export default App;