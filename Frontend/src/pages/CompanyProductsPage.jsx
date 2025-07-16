import React from 'react';
import { useParams } from 'react-router-dom';

const mockCompanies = [
  { id: 1, name: 'Burger Palace' },
  { id: 2, name: 'Pizza Heaven' },
  { id: 3, name: 'Sushi World' },
];

const mockProducts = {
  1: [
    { id: 1, name: 'Hamburguesa Clásica', price: 80 },
    { id: 2, name: 'Hamburguesa Doble', price: 120 },
  ],
  2: [
    { id: 3, name: 'Pizza Margarita', price: 100 },
    { id: 4, name: 'Pizza Pepperoni', price: 130 },
  ],
  3: [
    { id: 5, name: 'Sushi Roll', price: 90 },
    { id: 6, name: 'Sashimi', price: 110 },
  ],
};

const CompanyProductsPage = () => {
  const { companyId } = useParams();
  const company = mockCompanies.find(c => c.id === Number(companyId));
  const products = mockProducts[companyId] || [];

  if (!company) return <div className="container"><h2>Empresa no encontrada</h2></div>;

  return (
    <div className="company-products-page container">
      <h2>Productos de {company.name}</h2>
      <div className="product-grid">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-image" />
            <div className="product-content">
              <h3>{product.name}</h3>
              <p className="product-price">${product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyProductsPage; 