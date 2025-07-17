import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StickyEmpresaNavbar from '../components/StickyEmpresaNavbar';
import { useParams } from 'react-router-dom';
// ...existing code...
import '../styles/empresa-home.css';

const EmpresaConfigPage = () => {
  const { empresaNombre } = useParams();
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', logo: null });
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/empresas/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const empresa = res.data[0];
        setForm({
          nombre: empresa.nombre || '',
          direccion: empresa.direccion || '',
          telefono: empresa.telefono || '',
          logo: null
        });
        setLogoPreview(empresa.logo ? (empresa.logo.startsWith('http') ? empresa.logo : `http://localhost:8000${empresa.logo}`) : null);
      } catch (err) {
        setError('Error al cargar datos de la empresa');
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresa();
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setForm(f => ({ ...f, logo: files[0] }));
      setLogoPreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('nombre', form.nombre);
    data.append('direccion', form.direccion);
    data.append('telefono', form.telefono);
    if (form.logo) data.append('logo', form.logo);
    try {
      setLoading(true);
      await axios.patch('http://localhost:8000/api/empresas/1/', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
    } catch (err) {
      setError('Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StickyEmpresaNavbar />
      <div className="empresa-config-container">
        <h2 className="empresa-config-title" style={{textAlign: 'center'}}>Información General</h2>
        <form className="empresa-config-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <input
              type="file"
              id="logo-input"
              name="logo"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleChange}
            />
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '3px solid #ccc',
                marginBottom: 8,
              }}
              onClick={() => document.getElementById('logo-input').click()}
              title="Cambiar logo"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="64" height="64" fill="#888" viewBox="0 0 24 24">
                  <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8-2h-1.26A7.97 7.97 0 0 0 12 4a7.97 7.97 0 0 0-6.74 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-8 10a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
                </svg>
              )}
            </div>
            <span style={{ color: '#888', fontSize: 14 }}>Haz clic en el logo para cambiarlo</span>
          </div>
          <label className="empresa-config-label">Nombre de la Empresa</label>
          <input className="empresa-config-input" name="nombre" value={form.nombre} onChange={handleChange} required />
          <label className="empresa-config-label">Dirección</label>
          <input className="empresa-config-input" name="direccion" value={form.direccion} onChange={handleChange} required />
          <label className="empresa-config-label">Teléfono</label>
          <input className="empresa-config-input" name="telefono" value={form.telefono} onChange={handleChange} required />
          <button className="empresa-config-btn" type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
          {success && <div className="empresa-config-success">¡Cambios guardados!</div>}
          {error && <div className="empresa-config-error">{error}</div>}
        </form>
      </div>
    </>
  );
}
export default EmpresaConfigPage;
