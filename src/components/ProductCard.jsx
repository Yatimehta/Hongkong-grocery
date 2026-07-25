import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Placeholder from './Placeholder';
import AddToCart from './AddToCart';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const hasImage = product.image && !imgError;

  return (
    <div
      className="product-card clickable-card"
      id={`product-card-${product.id.replace(/[^a-zA-Z0-9]/g, '-')}`}
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div className="product-card-image-wrap">
        {hasImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="product-card-placeholder">
            <Placeholder />
          </div>
        )}
        <span className="product-card-category-badge">{product.category || 'Uncategorized'}</span>
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price" style={{ marginBottom: '12px' }}>
          <span className="product-card-currency">HK$</span>
          <span className="product-card-amount">{product.price != null ? product.price.toFixed(product.price % 1 === 0 ? 0 : 2) : '—'}</span>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 'auto' }}>
          <AddToCart product={product} compact={true} />
        </div>
      </div>
    </div>
  );
}
