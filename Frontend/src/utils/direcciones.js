import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Obtener todas las direcciones del usuario
export const getDirecciones = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token de autenticación');
    
    const response = await axios.get(`${API_BASE}/direcciones/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo direcciones:', error);
    throw error;
  }
};

// Crear nueva dirección
export const createDireccion = async (direccionData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token de autenticación');
    
    console.log('Enviando datos de dirección:', direccionData); // Debug
    
    const response = await axios.post(`${API_BASE}/direcciones/`, direccionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creando dirección:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw error;
  }
};

// Actualizar dirección existente
export const updateDireccion = async (id, direccionData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token de autenticación');
    
    const response = await axios.put(`${API_BASE}/direcciones/${id}/`, direccionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando dirección:', error);
    throw error;
  }
};

// Eliminar dirección
export const deleteDireccion = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token de autenticación');
    
    await axios.delete(`${API_BASE}/direcciones/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    console.error('Error eliminando dirección:', error);
    throw error;
  }
};
