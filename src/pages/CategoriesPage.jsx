import React from 'react';
import { useStore } from '../hooks/useStore';
import CategoryCard from '../components/CategoryCard';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const { categories, loading, error } = useStore();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading categories...</p>
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

  return (
    <div className="categories-page container">
      <div className="page-header">
        <h1 className="page-title">All Categories</h1>
        <p className="page-subtitle">Browse our wide selection of authentic groceries</p>
      </div>
      
      <div className="categories-grid-full">
        {categories.map(cat => (
          <CategoryCard key={cat.name} category={cat} />
        ))}
      </div>
    </div>
  );
}
