import React from 'react';
import { Link } from 'react-router-dom';

const restaurants = [
  {
    id: 1,
    name: 'Burger Palace',
    category: 'Hamburguesas',
    rating: 4.5,
    deliveryTime: '20-30 min',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'Pizza Heaven',
    category: 'Pizzas',
    rating: 4.7,
    deliveryTime: '25-35 min',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'Sushi World',
    category: 'Sushi',
    rating: 4.3,
    deliveryTime: '30-40 min',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80'
  },
];

const categoryMap = {
  1: 'Hamburguesas',
  2: 'Pizzas',
  3: 'Sushi',
  4: 'Ensaladas',
  5: 'Postres',
};

const RestaurantGrid = ({ activeCategory }) => {
  const filtered = activeCategory ? restaurants.filter(r => r.category === categoryMap[activeCategory]) : restaurants;
  return (
    <div className="restaurant-grid">
      {filtered.map((restaurant) => (
        <Link to={`/company/${restaurant.id}/products`} key={restaurant.id} className="restaurant-card">
          <div className="card-image">
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '8px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="placeholder-image" style={{ display: 'none' }}>
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