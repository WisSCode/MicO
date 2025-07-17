import axios from 'axios';

export async function fetchEmpresasPublic() {
  // No requiere autenticación
  const res = await axios.get('http://localhost:8000/api/empresas/public/');
  return res.data;
}
