// Utilidad para obtener la empresa del usuario actual
import axios from 'axios';

export async function fetchEmpresaActual() {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:8000/api/empresas/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data[0];
}
