import React, { useEffect, useState } from 'react';
import { fetchEmpresaActual } from '../utils/empresa';
import axios from 'axios';
import { FaClock, FaCheck, FaUtensils, FaBoxOpen, FaChartBar } from 'react-icons/fa';
import StickyEmpresaNavbar from '../components/StickyEmpresaNavbar';
import { useParams } from 'react-router-dom';
import '../styles/empresa-home.css';

const HomeEmpresaPage = () => {
  const { empresaNombre } = useParams();
  const [pedidosHoy, setPedidosHoy] = useState([]);
  const [pedidosHistoricos, setPedidosHistoricos] = useState([]);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [ventasSemana, setVentasSemana] = useState([0,0,0,0,0,0,0]);
  const [labelsSemana, setLabelsSemana] = useState(['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']);
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // Obtener datos de la empresa
        const emp = await fetchEmpresaActual();
        setEmpresa(emp);
        const token = localStorage.getItem('token');
        // Pedidos normales
        const res = await axios.get('http://localhost:8000/api/pedidos/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pedidos = res.data;
        setPedidosHistoricos(pedidos);
        // Filtrar pedidos de hoy
        const hoy = new Date();
        const pedidosHoy = pedidos.filter(p => {
          const fecha = new Date(p.fecha_pedido);
          return fecha.toDateString() === hoy.toDateString();
        });
        setPedidosHoy(pedidosHoy);
        // Filtrar pedidos recientes (últimas 3 horas)
        const tresHoras = 3 * 60 * 60 * 1000;
        const ahora = Date.now();
        setPedidosRecientes(
          pedidos.filter(p => ahora - new Date(p.fecha_pedido).getTime() <= tresHoras)
        );
        // Calcular productos más vendidos
        const productoCount = {};
        pedidos.forEach(p => {
          if (p.items) {
            p.items.forEach(item => {
              if (!productoCount[item.producto]) productoCount[item.producto] = { ...item, cantidad: 0 };
              productoCount[item.producto].cantidad += item.cantidad;
            });
          }
        });
        const productos = Object.values(productoCount)
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 5);
        setProductosMasVendidos(productos);
        // Ventas semanales
        const ventasRes = await axios.get('http://localhost:8000/api/pedidos/ventas-semanales/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVentasSemana(ventasRes.data.ventas);
        setLabelsSemana(ventasRes.data.labels);
      } catch (err) {
        setPedidosHoy([]);
        setPedidosHistoricos([]);
        setPedidosRecientes([]);
        setProductosMasVendidos([]);
        setVentasSemana([0,0,0,0,0,0,0]);
      }
    };
    fetchPedidos();
  }, []);

  return (
    <div className="empresa-home">
      <StickyEmpresaNavbar />
      {/* Header empresa */}
      <div className="empresa-header">
        {empresa && empresa.logo ? (
          <img src={empresa.logo.startsWith('http') ? empresa.logo : `http://localhost:8000${empresa.logo}`} alt="Logo Empresa" className="empresa-logo" />
        ) : (
          <div className="empresa-logo" style={{background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>
            🏢
          </div>
        )}
        <span className="empresa-nombre">{empresa ? empresa.nombre : 'Mi Empresa'}</span>
      </div>
      <div className="empresa-cards-row">
        <div className="empresa-card">
          <FaBoxOpen size={32} color="#2563eb" />
          <div className="empresa-card-value">{pedidosHoy.length}</div>
          <div className="empresa-card-title">Pedidos Hoy</div>
        </div>
        <div className="empresa-card">
          <FaChartBar size={32} color="#16a34a" />
          <div className="empresa-card-value">{pedidosHistoricos.length}</div>
          <div className="empresa-card-title">Pedidos Históricos</div>
        </div>
      </div>
      <div className="empresa-main-row">
        <div className="empresa-pedidos-box">
          <div className="empresa-pedidos-title-row">
            <span className="empresa-pedidos-title">Pedidos Recientes (3h)</span>
            <a href="#" className="empresa-link">Ver todos</a>
          </div>
          <div className="empresa-pedidos-scroll">
            {pedidosRecientes.length === 0 && <div style={{color:'#64748b'}}>No hay pedidos recientes.</div>}
            {pedidosRecientes.map((p, i) => (
              <div className="empresa-pedido-card" key={p.id}>
                <span>{p.estado === 'pendiente' ? <FaClock color="#fbbf24" /> : p.estado === 'listo' ? <FaCheck color="#22c55e" /> : <FaUtensils color="#2563eb" />}</span>
                <div>
                  <div style={{fontWeight:600}}>Pedido #{p.id}</div>
                  <div style={{color:'#64748b', fontSize:13}}>{p.cliente_nombre} • ${p.total}</div>
                </div>
                <span className="empresa-pedido-estado">{p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="empresa-productos-box">
          <div className="empresa-productos-title-row">
            <span className="empresa-productos-title">Productos Más Vendidos</span>
            <a href="#" className="empresa-link">Ver todos</a>
          </div>
          <div className="empresa-productos-list">
            {productosMasVendidos.length === 0 && <div style={{color:'#64748b'}}>No hay ventas recientes.</div>}
            {productosMasVendidos.map((prod, i) => (
              <div className="empresa-producto-card" key={prod.producto}>
                <span className="empresa-producto-icon">🍞</span>
                <div>
                  <div className="empresa-producto-nombre">{prod.producto_nombre || 'Producto'}</div>
                  <div className="empresa-producto-precio">${prod.precio_unitario} c/u</div>
                </div>
                <span className="empresa-producto-ventas">{prod.cantidad} vendidos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Cuadro de ventas semanales */}
      <div className="empresa-ventas-box">
        <div className="empresa-ventas-title">Ventas de la Semana</div>
        {/* SVG dinámico con datos reales */}
        <div className="empresa-ventas-chart">
          <svg width="100%" height="180" viewBox="0 0 800 180">
            <defs>
              <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Calcular puntos para la polyline */}
            {(() => {
              const maxVenta = Math.max(...ventasSemana, 1);
              const puntos = ventasSemana.map((v, i) => {
                // Espaciado horizontal
                const x = 40 + i * 120;
                // Altura: 160 = base, 20 = tope
                const y = 160 - (v / maxVenta) * 140;
                return `${x},${y}`;
              }).join(' ');
              // Para el área bajo la curva
              const area = puntos + ' 800,180 0,180 ' + puntos.split(' ')[0];
              return <>
                <polyline fill="url(#ventasGradient)" stroke="#a78bfa" strokeWidth="4" points={area} />
                <polyline fill="none" stroke="#a78bfa" strokeWidth="4" points={puntos} />
                {ventasSemana.map((v, i) => {
                  const x = 40 + i * 120;
                  const y = 160 - (v / maxVenta) * 140;
                  return <circle key={i} cx={x} cy={y} r="6" fill="#a78bfa" fillOpacity="0.7" />;
                })}
                {/* Ejes y etiquetas */}
                {labelsSemana.map((lab, i) => (
                  <text key={lab} x={40 + i * 120} y={170} fontSize="18" fill="#888">{lab}</text>
                ))}
                {/* Eje Y */}
                <text x="0" y="160" fontSize="16" fill="#888">$0</text>
                <text x="0" y="90" fontSize="16" fill="#888">${Math.round(maxVenta/2)}</text>
                <text x="0" y="30" fontSize="16" fill="#888">${maxVenta}</text>
              </>;
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HomeEmpresaPage;
