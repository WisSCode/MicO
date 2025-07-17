import React from 'react';

const categories = [
  { id: 1, name: 'Hamburguesas' },
  { id: 2, name: 'Pizzas' },
  { id: 3, name: 'Sushi' },
  { id: 4, name: 'Ensaladas' },
  { id: 5, name: 'Postres' },
];

const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => setActiveCategory(category.id)}
        >
          {category.name}
        </button>
      ))}
      <button
        className={`category-btn ${activeCategory === null ? 'active' : ''}`}
        onClick={() => setActiveCategory(null)}
        style={{ marginLeft: 12 }}
      >
        Todas
      </button>
    </div>
  );
};

export default CategoryFilter;