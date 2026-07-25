import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import ProductGrid from '../components/ProductGrid';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchProducts, loading, error } = useStore();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(query);
  }, [query, searchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newQuery = e.target.elements.search.value;
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery.trim() });
    }
  };

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

  return (
    <div className="search-page container">
      <div className="page-header text-center">
        <h1 className="page-title">Search Results</h1>
        {query && (
          <p className="page-subtitle">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        )}
      </div>

      <div className="search-form-container">
        <form className="search-page-form" onSubmit={handleSearch}>
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Search for products, categories, or SKUs..."
            className="search-page-input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>
      
      {!query.trim() ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <h2>What are you looking for?</h2>
          <p>Type a keyword above to search our entire catalog.</p>
        </div>
      ) : results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">😕</span>
          <h2>No Results Found</h2>
          <p>We couldn't find anything matching "{query}".</p>
          <p className="empty-state-hint">Try checking your spelling or using more general terms.</p>
          <Link to="/categories" className="btn btn-outline" style={{marginTop: '1rem'}}>Browse Categories</Link>
        </div>
      )}
    </div>
  );
}
