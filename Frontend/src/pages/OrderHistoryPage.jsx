import React from 'react';

const mockOrders = [
  {
    id: 1,
    company: 'Burger Palace',
    product: 'Hamburguesa Clásica',
    date: '2024-07-15',
    status: 'Entregado',
  },
  {
    id: 2,
    company: 'Pizza Heaven',
    product: 'Pizza Margarita',
    date: '2024-07-14',
    status: 'En camino',
  },
];

const OrderHistoryPage = () => {
  return (
    <div className="order-history-page container">
      <h2>Historial de Pedidos</h2>
      <table className="order-history-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Producto</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {mockOrders.map(order => (
            <tr key={order.id}>
              <td>{order.company}</td>
              <td>{order.product}</td>
              <td>{order.date}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistoryPage; 