import React, { useContext, useState, useRef } from 'react';
import { UserContext } from '../components/UserContext';
import { FaUserCircle, FaCamera } from 'react-icons/fa';
import axios from 'axios';

const BASE_URL = "http://localhost:8000";

const RepartidorConfigPage = () => {
  const { user, login } = useContext(UserContext);
  const [name, setName] = useState(user?.name || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [preview, setPreview] = useState(user?.profile_pic || null);
  const fileInputRef = useRef();

  const [selectedFile, setSelectedFile] = useState(null);
  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('telefono', telefono);
    if (selectedFile) {
      formData.append('profile_pic', selectedFile);
    }
  
    // Si necesitas enviar el token:
    const token = localStorage.getItem('token');
  
    try {
      const response = await axios.put(
        'http://localhost:8000/user/profile/', // Ajusta la URL según tu backend
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Actualiza el contexto de usuario con la respuesta del backend
      login(response.data);
      setPreview(null);
    setSelectedFile(null);
      alert('¡Datos actualizados!');
    } catch (error) {
        if (error.response) {
            console.error('Error response:', error.response.data);
            alert('Error: ' + JSON.stringify(error.response.data));
          } else if (error.request) {
            console.error('Error request:', error.request);
            alert('Error: No response received from server');
          } else {
            console.error('General error:', error.message);
            alert('Error: ' + error.message);
          }
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 24 }}>Configuración de Repartidor</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 100, height: 100 }}>
          {preview ? (
                <img
                    src={preview}
                    alt="Perfil"
                    style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                />
                ) : user?.profile_pic ? (
                <img
                    src={user.profile_pic.startsWith('http') ? user.profile_pic : BASE_URL + user.profile_pic}
                    alt="Perfil"
                    style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                />
                ) : (
                <FaUserCircle size={100} color="#cbd5e1" />
                )}
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002',
              }}
              title="Cambiar foto"
            >
              <FaCamera />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handlePicChange}
            />
          </div>
        </div>
        <label style={{ fontWeight: 500 }}>ID
          <input type="text" value={user?.id || ''} readOnly style={{ width: '100%', marginTop: 4, background: '#f1f5f9', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }} />
        </label>
        <label style={{ fontWeight: 500 }}>Nombre
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', marginTop: 4, border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }} />
        </label>
        <label style={{ fontWeight: 500 }}>Teléfono
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} required style={{ width: '100%', marginTop: 4, border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }} />
        </label>
        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', marginTop: 12 }}>
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default RepartidorConfigPage;