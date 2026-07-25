import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import './ProductGrid.css';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A → Z' },
  { value: 'name-desc', label: 'Name Z → A' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

export default function ProductGrid({ products, perPage = 24, showSort = true, title = '' }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name-asc');

  // Sort products
  const sorted = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case 'name-asc':
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return arr;
    }
  }, [products, sortBy]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Reset to page 1 when products or sort changes
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="product-grid-wrapper">
      {/* Toolbar */}
      <div className="product-grid-toolbar">
        <div className="product-grid-count">
          {title && <h2 className="product-grid-title">{title}</h2>}
          <span className="product-grid-count-text">{products.length} product{products.length !== 1 ? 's' : ''}</span>
        </div>
        {showSort && products.length > 1 && (
          <div className="product-grid-sort">
            <label htmlFor="sort-select" className="sr-only">Sort by</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={handleSortChange}
              className="product-grid-sort-select"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className="product-grid">
          {paginated.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="product-grid-empty">
          <p>No products found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
