import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function searchEmpresasYComidas(query) {
  // Buscar empresas por nombre
  const empresasRes = await axios.get(`${API_BASE}/empresas/public/?search=${encodeURIComponent(query)}`);
  // Buscar productos por nombre (con token si existe)
  const token = localStorage.getItem('token');
  const productosRes = await axios.get(`${API_BASE}/productos/public/?search=${encodeURIComponent(query)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return {
    empresas: Array.isArray(empresasRes.data) ? empresasRes.data : [],
    productos: Array.isArray(productosRes.data) ? productosRes.data : [],
  };
}
