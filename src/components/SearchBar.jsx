import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, compact = false, autoFocus = false }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form className={`search-bar ${compact ? 'search-bar-compact' : ''}`} onSubmit={handleSubmit} id="search-bar">
      <div className="search-bar-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        className="search-bar-input"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search products"
        id="search-input"
      />
      {query && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={() => { setQuery(''); inputRef.current?.focus(); }}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
      <button type="submit" className="search-bar-submit" aria-label="Search" id="search-submit">
        Search
      </button>
    </form>
  );
}
