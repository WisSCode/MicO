import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function addToCart(productoId, quantity = 1) {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_BASE}/cart/add-item/`, {
    producto_id: productoId,
    quantity
  }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
}
