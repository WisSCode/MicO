import React, { useState, useEffect } from 'react';
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
import OrderPage from './pages/OrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CompanyProductsPage from './pages/CompanyProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import HamburgerMenu from './components/HamburgerMenu';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/main.css';
import { FaHamburger } from 'react-icons/fa';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#f97316',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          Mic <span style={{color: '#f97316', display: 'flex', alignItems: 'center'}}><FaHamburger /></span>
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #fde4cf',
          borderTop: '4px solid #f97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Header onMenuToggle={handleMenuToggle} />
        <HamburgerMenu isOpen={isMenuOpen} onToggle={handleMenuToggle} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          <Route path="/homeuser" element={
            <PrivateRoute>
              <HomePage />
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
            <Route path="/order" element={<OrderPage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/company/:companyId/products" element={<CompanyProductsPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;