import React from 'react';
import './GestionUser.css';

import { FaEdit } from 'react-icons/fa'; // Solo se necesita FaEdit

const GestionUser = () => {
  const usuarios = [
    {
      id: 1,
      nombre: "Ana García",
      email: "ana.garcia@email.com",
      rol: "Cliente",
      estado: "Activo",
      registro: "15 Nov 2024",
      pedidos: 24
    },
    {
      id: 2,
      nombre: "Tacos el Rápido",
      email: "tacos@empresa.com",
      rol: "Empresa",
      estado: "Activo",
      registro: "10 Nov 2024",
      pedidos: 156
    },
    {
      id: 3,
      nombre: "Carlos Ruiz",
      email: "carlos.ruiz@email.com",
      rol: "Repartidor",
      estado: "En línea",
      estado_detalle: "Activo",
      registro: "05 Nov 2024",
      pedidos: 89
    }
  ];

  return (
    <div className="gestion-usuarios-container">
      {/* Encabezado con espaciado mejorado */}
      <div className="header-section">
        <h1 className="main-title">Gestión de Usuarios</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Barra de herramientas - Ajustada para espaciado y alineación */}
        {/* Se eliminó el botón "+ Nuevo Usuario" */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="todos">Todos los roles</option>
            <option value="empresa">Empresa</option>
            <option value="cliente">Cliente</option>
            <option value="repartidor">Repartidor</option>
          </select>
          <input
            type="search"
            placeholder="Buscar usuario..."
            className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2 sm:mt-0 sm:ml-4"
          />
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 thead-light">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider actions-column">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <div className="font-medium text-gray-900">{usuario.nombre}</div>
                        <div className="text-gray-500 text-xs text-left w-full">{usuario.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          usuario.rol === 'Cliente' ? 'bg-indigo-100 text-indigo-800' :
                          usuario.rol === 'Empresa' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                      }`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          usuario.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                          usuario.estado === 'En línea' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{usuario.registro}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{usuario.pedidos}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium actions-column">
                      <div className="flex justify-center">
                        {/* Solo el botón de Editar */}
                        <button className="text-blue-500 hover:text-blue-700 p-1 rounded" title="Editar">
                          <FaEdit className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionUser;