import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import ProductGrid from '../components/ProductGrid';
import './CategoryPage.css';

export default function CategoryPage() {
  const { categoryName } = useParams();
  const { categories, getProductsByCategory, loading, error } = useStore();

  const decodedName = decodeURIComponent(categoryName);

  const category = categories.find(c => c.name === decodedName);

  const categoryProducts = useMemo(() => {
    return getProductsByCategory(decodedName);
  }, [getProductsByCategory, decodedName]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading products...</p>
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

  if (!category && categoryProducts.length === 0) {
    return (
      <div className="empty-state container">
        <span className="empty-state-icon">🔍</span>
        <h2>Category Not Found</h2>
        <p>We couldn't find the category "{decodedName}".</p>
        <Link to="/categories" className="btn btn-primary">Browse All Categories</Link>
      </div>
    );
  }

  return (
    <div className="category-page container">
      <div className="page-header breadcrumb-header">
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to="/categories">Categories</Link>
          <span className="separator">/</span>
          <span className="current">{decodedName}</span>
        </div>
        <h1 className="page-title">{decodedName}</h1>
        <p className="page-subtitle">{categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''} available</p>
      </div>
      
      {categoryProducts.length > 0 ? (
        <ProductGrid products={categoryProducts} />
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">🛒</span>
          <h2>No Products Yet</h2>
          <p>We're currently restocking this category. Check back soon!</p>
          <Link to="/categories" className="btn btn-primary">Browse Other Categories</Link>
        </div>
      )}
    </div>
  );
}
