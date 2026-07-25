import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import Placeholder from '../components/Placeholder';
import AddToCart from '../components/AddToCart';
import './ProductPage.css';

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getProduct, loading, error } = useStore();

  const product = getProduct(productId);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state container">
        <span className="empty-state-icon">📦</span>
        <h2>Product Not Found</h2>
        <p>We couldn't find the product you're looking for.</p>
        <button onClick={() => navigate(-1)} className="btn btn-outline">Go Back</button>
        <Link to="/" className="btn btn-primary" style={{marginTop: '1rem'}}>Go to Home</Link>
      </div>
    );
  }

  const inStock = product.available;
  const categoryName = product.category || 'Uncategorized';

  return (
    <div className="product-page container">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span className="separator">/</span>
        <Link to="/categories">Categories</Link>
        <span className="separator">/</span>
        <Link to={`/category/${encodeURIComponent(categoryName)}`}>
          {categoryName}
        </Link>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-detail-image-container">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-detail-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="product-detail-placeholder" style={{ display: product.image ? 'none' : 'flex' }}>
            <Placeholder text="No Image" />
          </div>
          {inStock && (
            <div className="product-detail-badge badge-instock">In Stock</div>
          )}
          {!inStock && (
            <div className="product-detail-badge badge-outstock">Out of Stock</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-sku">SKU: {product.id}</p>
          
          <div className="product-detail-price">
            <span className="current-price">HK${product.price != null ? Number(product.price).toFixed(2) : '—'}</span>
          </div>

          <div className="product-detail-actions">
            <p className="product-detail-notice">
              To purchase, add items to your cart or visit our store in person.
            </p>
            <div className="action-buttons">
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <AddToCart product={product} />
              </div>
              <a 
                href="https://maps.google.com/?q=65-67+South+Wall+Road,+Kowloon+City"
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline btn-lg"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span className="icon">📍</span> Visit Store
              </a>
            </div>
          </div>

          <div className="product-detail-categories">
            <h3>Category</h3>
            <div className="category-tags">
              <Link to={`/category/${encodeURIComponent(categoryName)}`} className="category-tag">
                {categoryName}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
