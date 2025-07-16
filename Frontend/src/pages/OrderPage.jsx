import React, { useState } from 'react';

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

const orderStages = [
  'Recibido',
  'Preparando',
  'En camino',
  'Entregado',
];

const OrderPage = () => {
  const [company, setCompany] = useState('');
  const [product, setProduct] = useState('');
  const [stage, setStage] = useState(0);
  const [order, setOrder] = useState(null);

  const handleOrder = (e) => {
    e.preventDefault();
    setOrder({ company, product });
    setStage(1);
  };

  return (
    <div className="order-page container">
      <h2>Realizar Pedido</h2>
      <form className="order-form" onSubmit={handleOrder}>
        <div className="form-group">
          <label>Empresa:</label>
          <select value={company} onChange={e => { setCompany(e.target.value); setProduct(''); }} required>
            <option value="">Selecciona una empresa</option>
            {mockCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {company && (
          <div className="form-group">
            <label>Producto:</label>
            <select value={product} onChange={e => setProduct(e.target.value)} required>
              <option value="">Selecciona un producto</option>
              {mockProducts[company].map(p => (
                <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
              ))}
            </select>
          </div>
        )}
        <button className="btn-primary" type="submit" disabled={!company || !product}>Pedir</button>
      </form>

      {order && (
        <div className="order-status">
          <h3>Estado del pedido</h3>
          <div className="order-stages">
            {orderStages.map((s, idx) => (
              <div key={s} className={`stage ${stage >= idx ? 'active' : ''}`}>{s}</div>
            ))}
          </div>
          {stage < orderStages.length - 1 && (
            <button className="btn-outline" onClick={() => setStage(stage + 1)} style={{marginTop: '1rem'}}>Avanzar etapa</button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderPage; 