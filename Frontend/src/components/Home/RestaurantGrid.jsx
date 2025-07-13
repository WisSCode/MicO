import React from 'react';
import { Link } from 'react-router-dom';

const restaurants = [
  {
    id: 1,
    name: 'Burger Palace',
    category: 'Hamburguesas',
    rating: 4.5,
    deliveryTime: '20-30 min',
    image: 'burger-palace.jpg'
  },
  {
    id: 2,
    name: 'Pizza Heaven',
    category: 'Pizzas',
    rating: 4.7,
    deliveryTime: '25-35 min',
    image: 'pizza-heaven.jpg'
  },
  // Agrega más restaurantes según necesites
];

const RestaurantGrid = () => {
  return (
    <div className="restaurant-grid">
      {restaurants.map((restaurant) => (
        <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id} className="restaurant-card">
          <div className="card-image">
            <img src={`/assets/images/${restaurant.image}`} alt={restaurant.name} />
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