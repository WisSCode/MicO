import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch, FaBoxOpen, FaEdit, FaTrash } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import '../styles/empresa-home.css';

const ProductosEmpresaPage = () => {
  const { empresaNombre } = useParams();
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState({ open: false, producto: null });
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', imagen: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/productos/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(res.data);
    } catch (err) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleOpenModal = (producto = null) => {
    setModal({ open: true, producto });
    setForm(producto ? {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: null
    } : { nombre: '', descripcion: '', precio: '', imagen: null });
  };

  const handleCloseModal = () => {
    setModal({ open: false, producto: null });
    setForm({ nombre: '', descripcion: '', precio: '', imagen: null });
    setError('');
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      setForm(f => ({ ...f, imagen: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('nombre', form.nombre);
    data.append('descripcion', form.descripcion);
    data.append('precio', form.precio);
    if (form.imagen) data.append('imagen', form.imagen);
    try {
      setLoading(true);
      if (modal.producto) {
        // Editar
        await axios.put(`http://localhost:8000/api/productos/${modal.producto.id}/`, data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Crear
        await axios.post('http://localhost:8000/api/productos/', data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchProductos();
      handleCloseModal();
    } catch (err) {
      setError('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto desde la card
  const handleDeleteCard = async (producto) => {
    if (!producto) return;
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/productos/${producto.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProductos();
      handleCloseModal();
    } catch (err) {
      setError('Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="empresa-home">
      <div className="empresa-header" style={{gap: '1.5rem', flexWrap: 'wrap'}}>
        <span className="empresa-nombre"><FaBoxOpen style={{marginRight:8}}/> Productos de la Empresa</span>
        <div style={{position:'relative', minWidth:220}}>
          <FaSearch style={{position:'absolute', left:12, top: '50%', transform:'translateY(-50%)', color:'#64748b'}} />
          <input
            type="text"
            className="busqueda-input"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{padding:'0.6rem 1rem 0.6rem 2.2rem', borderRadius:'0.7rem', border:'1px solid #e5e7eb', fontSize:'1rem', minWidth:220}}
          />
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}><FaEdit style={{marginRight:6}}/>Agregar Producto</button>
      </div>
      {loading && <div style={{color:'#64748b'}}>Cargando...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
       <div className="productos-grid">
        {productos.filter(prod =>
          prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          prod.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
        ).map(prod => (
          <div className="producto-card" key={prod.id}>
            <div className="producto-img-box">
              {prod.imagen
                ? <img src={prod.imagen.startsWith('http') ? prod.imagen : `http://localhost:8000${prod.imagen}`} alt={prod.nombre} className="producto-img" />
                : <FaBoxOpen size={38} style={{color:'#f59e42'}} />
              }
            </div>
            <div className="producto-card-body">
              <div className="producto-card-header">
                <span className="producto-nombre">{prod.nombre}</span>
              </div>
              <div className="producto-descripcion">{prod.descripcion}</div>
              <div className="producto-precio">${Number(prod.precio).toLocaleString('es-PA')}</div>
              <div className="producto-card-actions">
                <button className="btn-editar" onClick={() => handleOpenModal(prod)}>
                  <FaEdit style={{marginRight:4}}/> Editar
                </button>
                <button className="btn-eliminar" onClick={() => handleDeleteCard(prod)}>
                  <FaTrash style={{marginRight:4}}/>
                </button>
              </div>
            </div>
          </div>
        ))}
         {productos.filter(prod =>
           prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
           prod.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
         ).length === 0 && !loading && <div style={{color:'#64748b'}}>No hay productos registrados.</div>}
      </div>
      {modal.open && (
        <div className="modal-bg">
          <div className="modal">
            <h3>{modal.producto ? 'Editar Producto' : 'Agregar Producto'}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" rows={3} />
              <input name="precio" value={form.precio} onChange={handleChange} placeholder="Precio" type="number" min="0" step="0.01" required />
              <input name="imagen" type="file" accept="image/*" onChange={handleChange} />
              <div style={{marginTop:12, display:'flex', gap:8}}>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
              </div>
              {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosEmpresaPage;
