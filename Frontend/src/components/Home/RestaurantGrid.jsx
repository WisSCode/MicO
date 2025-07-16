import React from 'react';
import { Link } from 'react-router-dom';

const restaurants = [
  {
    id: 1,
    name: 'Burger Palace',
    category: 'Hamburguesas',
    rating: 4.5,
    deliveryTime: '20-30 min',
    image: null // Usaremos placeholder
  },
  {
    id: 2,
    name: 'Pizza Heaven',
    category: 'Pizzas',
    rating: 4.7,
    deliveryTime: '25-35 min',
    image: null // Usaremos placeholder
  },
  {
    id: 3,
    name: 'Sushi World',
    category: 'Sushi',
    rating: 4.3,
    deliveryTime: '30-40 min',
    image: null // Usaremos placeholder
  },
];

const RestaurantGrid = () => {
  return (
    <div className="restaurant-grid">
      {restaurants.map((restaurant) => (
        <Link to={`/company/${restaurant.id}/products`} key={restaurant.id} className="restaurant-card">
          <div className="card-image">
            <div className="placeholder-image">
              <span>{restaurant.name.charAt(0)}</span>
            </div>
          </div>
          <div className="card-content">
            <h3>{restaurant.name}</h3>
            <div className="card-meta">
              <span className="category">{restaurant.category}</span>
              <span className="rating">★ {restaurant.rating}</span>
            </div>
            <p className="delivery-time">{restaurant.deliveryTime}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RestaurantGrid;