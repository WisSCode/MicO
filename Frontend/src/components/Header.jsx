import { Link } from 'react-router-dom';
import { FaHamburger, FaShoppingCart, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { CartContext } from '../components/Cart';

const Header = () => {
  const { cartItems } = useContext(CartContext);

  return (
    <header className="header">
      <motion.div 
        className="logo"
        whileHover={{ scale: 1.1 }}
      >
        <Link to="/">
          <span className="logo-text">MIC</span>
          <FaHamburger className="logo-icon" />
        </Link>
      </motion.div>
      
      <div className="search-bar-container">
        <input 
          type="text" 
          placeholder="Buscar restaurantes o comidas..." 
          className="search-bar"
        />
      </div>
      
      <nav className="nav-links">
        <Link to="/" className="nav-link">Inicio</Link>
        <Link to="/profile" className="nav-link">
          <FaUser className="icon" />
        </Link>
        <Link to="/checkout" className="nav-link cart-link">
          <FaShoppingCart className="icon" />
          {cartItems.length > 0 && (
            <span className="cart-badge">{cartItems.length}</span>
          )}
        </Link>
      </nav>
    </header>
  );
};

export default Header;