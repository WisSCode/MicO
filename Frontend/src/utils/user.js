// Utilidad para obtener y actualizar el usuario actual
import axios from 'axios';

export async function fetchUsuarioActual() {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:8000/user/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function updateUsuarioActual(data) {
  const token = localStorage.getItem('token');
  const res = await axios.patch('http://localhost:8000/user/', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
