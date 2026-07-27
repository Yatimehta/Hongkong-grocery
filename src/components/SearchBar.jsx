import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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
        <Search size={18} />
      </div>
      <input
        ref={inputRef}
        type="text"
        className="search-bar-input"
        placeholder="Search groceries..."
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
          <X size={16} />
        </button>
      )}
      <button type="submit" className="search-bar-submit" aria-label="Search" id="search-submit">
        Search
      </button>
    </form>
  );
}
