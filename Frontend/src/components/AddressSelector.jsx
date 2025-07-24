import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import AddressManager from './AddressManager';

const AddressSelector = ({ selectedAddress, onAddressChange, placeholder = "Seleccionar dirección" }) => {
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(selectedAddress);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    // Cargar la última dirección seleccionada si no se proporciona una
    if (!selectedAddress) {
      const lastAddress = localStorage.getItem('lastSelectedAddress');
      if (lastAddress) {
        try {
          const address = JSON.parse(lastAddress);
          setCurrentAddress(address);
          onAddressChange(address);
        } catch (error) {
          console.error('Error loading last address:', error);
        }
      }
    }
  }, [selectedAddress, onAddressChange]);

  const handleAddressSelect = (address) => {
    setCurrentAddress(address);
    localStorage.setItem('lastSelectedAddress', JSON.stringify(address));
    onAddressChange(address);
    setShowAddressManager(false);
  };

  return (
    <>
      <div
        onClick={() => setShowAddressManager(true)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.9rem',
          border: `2.5px solid ${isHover ? '#ff8000' : '#f97316'}`,
          borderRadius: '20px',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          minHeight: '36px',
          boxShadow: isHover
            ? '0 0 0 4px rgba(255, 128, 0, 0.10), 0 2px 8px 0 rgba(249, 115, 22, 0.08)'
            : '0 2px 8px 0 rgba(249, 115, 22, 0.08)',
          fontWeight: 500
        }}
      >
        <FaMapMarkerAlt style={{ color: '#f97316', fontSize: '1.1rem' }} />
        <div style={{ flex: 1 }}>
          {currentAddress ? (
            <div style={{ 
              fontWeight: 500, 
              color: '#333',
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentAddress.nombre}
            </div>
          ) : (
            <div style={{ color: '#999' }}>
              {placeholder}
            </div>
          )}
        </div>
        <FaChevronDown style={{ color: '#666', fontSize: '0.9rem' }} />
      </div>

      {showAddressManager && (
        <AddressManager
          selectedAddress={currentAddress}
          onAddressSelect={handleAddressSelect}
          onClose={() => setShowAddressManager(false)}
        />
      )}
    </>
  );
};

export default AddressSelector;
