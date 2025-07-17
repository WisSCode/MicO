import React from 'react';
import './GestionEmpresas.css';

// Iconos necesarios: FaEdit, FaCheckCircle, FaTimesCircle
// MdRestaurant, MdLocalCafe, MdOutlineLocalPizza para los iconos de empresa
// IoCubeOutline para Productos, LuClipboardList para Pedidos
import { FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdRestaurant, MdLocalCafe, MdOutlineLocalPizza } from 'react-icons/md';
import { IoCubeOutline } from "react-icons/io5"; // Para Productos
import { LuClipboardList } from "react-icons/lu"; // Para Pedidos

const GestionEmpresas = () => {
    const empresas = [
        {
            id: 1,
            nombre: "Tacos el Rápido",
            productos: 23,
            pedidos: 156,
            estado: "Activa",
            categoryType: "mexicanFood"
        },
        {
            id: 2,
            nombre: "Pizza Suprema",
            productos: 18,
            pedidos: 203,
            estado: "Activa",
            categoryType: "pizza"
        },
        {
            id: 3,
            nombre: "Café Aroma",
            productos: 12,
            pedidos: 0,
            estado: "Pendiente",
            categoryType: "coffee"
        }
    ];

    const getStatusClass = (estado) => {
        switch (estado.toLowerCase()) {
            case 'activa':
                return 'status-active';
            case 'pendiente':
                return 'status-pending';
            default:
                return '';
        }
    };

    const getCompanyIcon = (type) => {
        switch (type) {
            case 'mexicanFood':
                return <MdRestaurant />;
            case 'pizza':
                return <MdOutlineLocalPizza />;
            case 'coffee':
                return <MdLocalCafe />;
            default:
                return <MdRestaurant />;
        }
    };

    return (
        <div className="gestion-empresas-container">
            <div className="header-section">
                <h2>Gestión de Empresas</h2>
                <div className="header-actions">
                    <select className="category-select">
                        <option>Todas las categorías</option>
                        <option>Comida Mexicana</option>
                        <option>Pizzería</option>
                        <option>Cafetería</option>
                    </select>
                    {/* Botón "Nueva Empresa" Eliminado */}
                </div>
            </div>

            <div className="empresa-cards-grid">
                {empresas.map(empresa => (
                    <div key={empresa.id} className="empresa-card">
                        <div className="card-top">
                            <div className={`company-icon-circle ${empresa.estado === 'Activa' ? 'active-icon-bg' : 'pending-icon-bg'}`}>
                                {getCompanyIcon(empresa.categoryType)}
                            </div>
                            <div className="company-info">
                                <h3 className="company-name">{empresa.nombre}</h3>
                            </div>
                            <span className={`company-status ${getStatusClass(empresa.estado)}`}>
                                {empresa.estado}
                            </span>
                        </div>

                        <div className="card-stats-row">
                            <div className="stat-item">
                                <IoCubeOutline className="stat-icon" />
                                <span>{empresa.productos}</span>
                                <span className="stat-label">Productos</span>
                            </div>
                            <div className="stat-item">
                                <LuClipboardList className="stat-icon" />
                                <span>{empresa.pedidos}</span>
                                <span className="stat-label">Pedidos</span>
                            </div>
                        </div>

                        {/* The action buttons (Editar, Aprobar, Rechazar) have been removed from here */}
                        <div className="card-actions-bottom">
                            {/* No buttons are rendered here as per your request */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GestionEmpresas;
