import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Check, Plus, Minus } from 'lucide-react';
import './AddToCart.css';

export default function AddToCart({ product, compact = false }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    setAdded(true);
    setQuantity(1); // Reset after adding
    setTimeout(() => setAdded(false), 2000);
  };

  const decrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(Math.max(1, quantity - 1));
  };

  const increment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(quantity + 1);
  };

  return (
    <div className={`add-to-cart-widget ${compact ? 'compact' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="qty-selector">
        <button className="qty-btn" onClick={decrement} disabled={quantity <= 1} aria-label="Decrease quantity">
          <Minus size={14} />
        </button>
        <span className="qty-display">{quantity}</span>
        <button className="qty-btn" onClick={increment} aria-label="Increase quantity">
          <Plus size={14} />
        </button>
      </div>
      <button 
        className={`btn btn-primary btn-add ${added ? 'added' : ''}`}
        onClick={handleAdd}
        disabled={!product.available}
      >
        {added ? (
          <>
            <Check size={16} /> Added
          </>
        ) : (
          <>
            <ShoppingBag size={16} /> Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
