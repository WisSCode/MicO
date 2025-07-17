import React, { useState } from 'react';
import './AddToCartModal.css';

const AddToCartModal = ({ product, open, onClose, onAdd }) => {
  const [quantity, setQuantity] = useState(1);

  if (!open || !product) return null;

  const handleAdd = () => {
    onAdd(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{product.nombre}</h2>
        <p>{product.descripcion}</p>
        <p><b>Precio:</b> ${product.precio}</p>
        <div className="modal-quantity">
          <label>Cantidad:</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            style={{width:'60px'}}
          />
        </div>
        <button className="modal-add" onClick={handleAdd}>Añadir al carrito</button>
      </div>
    </div>
  );
};

export default AddToCartModal;
