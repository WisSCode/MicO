import React, { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Load user from localStorage on app start
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Load orders from localStorage
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData) => {
    try {
      // Solo agrega createdAt si lo necesitas, pero NO sobrescribas id ni name
      const userToSave = {
        ...userData,
      createdAt: new Date().toISOString()
      };
      setUser(userToSave);
      localStorage.setItem('user', JSON.stringify(userToSave));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      // Clear cart on logout
      localStorage.removeItem('cart');
      localStorage.removeItem('pendingOrder');
      // Dispatch event to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const addOrder = (order) => {
    try {
      const newOrders = [...orders, order];
      setOrders(newOrders);
      localStorage.setItem('orders', JSON.stringify(newOrders));
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const updateOrder = (orderId, updates) => {
    try {
      const updatedOrders = orders.map(order => 
        order.orderId === orderId ? { ...order, ...updates } : order
      );
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    orders,
    addOrder,
    updateOrder,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 