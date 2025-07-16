import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderPage from './pages/OrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CompanyProductsPage from './pages/CompanyProductsPage';
import './styles/main.css';

function App() {
  return (
    <Router>
     
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/company/:companyId/products" element={<CompanyProductsPage />} />
        </Routes>
      </main>
      
    </Router>
  );
}

export default App;