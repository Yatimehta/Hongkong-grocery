import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const StoreContext = createContext(null);

// Global config — shop owner can toggle these
const CONFIG = {
  SHOW_ALL_AS_AVAILABLE: true, // Ignore stale in_stock field
  PRODUCTS_PER_PAGE: 24,
  CURRENCY: 'HK$',
};

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      let productsData = [];
      let categoriesData = [];

      try {
        const [apiProdRes, apiCatRes] = await Promise.all([
          fetch('/api/products?limit=all'),
          fetch('/api/categories'),
        ]);

        if (apiProdRes.ok && apiCatRes.ok) {
          const prodResult = await apiProdRes.json();
          const catResult = await apiCatRes.json();
          const fetchedProds = prodResult.products || prodResult.data || prodResult;
          if (Array.isArray(fetchedProds) && fetchedProds.length > 0) {
            productsData = fetchedProds;
            categoriesData = Array.isArray(catResult) ? catResult : (catResult.data || []);
          }
        }
      } catch (apiErr) {
        console.log('API fetch attempt fallback to static JSON:', apiErr);
      }

      // Fallback to static sample json if DB is empty or API unavailable
      if (!productsData.length) {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/data/products.json'),
          fetch('/data/categories.json'),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to load store catalog');
        }
        productsData = await productsRes.json();
        categoriesData = await categoriesRes.json();
      }

      // Process products: normalize image, price and category fields for both DB and JSON structures
      const processedProducts = productsData.map(p => {
        let imgUrls = p.image_urls || [];
        if (typeof p.images === 'string') {
          try { imgUrls = JSON.parse(p.images); } catch(e) {}
        } else if (Array.isArray(p.images)) {
          imgUrls = p.images.map(img => (typeof img === 'object' && img !== null ? img.url : img));
        }
        if (p.image && !imgUrls.length) imgUrls = [p.image];

        const catName = typeof p.category === 'object' && p.category !== null 
          ? (p.category.name || 'Uncategorized')
          : (typeof p.category === 'string' && p.category ? p.category : (p.categoryName || (p.categoryObj ? p.categoryObj.name : 'Uncategorized')));

        return {
          ...p,
          id: String(p.id),
          name: p.name || p.title || 'Grocery Item',
          price: Number(p.price || 0),
          image_urls: imgUrls,
          image: imgUrls[0] || p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
          available: CONFIG.SHOW_ALL_AS_AVAILABLE ? true : (p.stock > 0 || p.in_stock),
          slug: encodeURIComponent(String(p.id)),
          category: catName
        };
      });

      // Ensure "Uncategorized" category exists
      const categoryNames = new Set(categoriesData.map(c => c.name));
      let allCategories = [...categoriesData];
      if (!categoryNames.has('Uncategorized')) {
        allCategories.push({
          id: 'uncategorized',
          name: 'Uncategorized',
          product_count: 0,
        });
      }

      // Compute live product counts per category
      const countMap = {};
      processedProducts.forEach(p => {
        const cat = p.category || 'Uncategorized';
        countMap[cat] = (countMap[cat] || 0) + 1;
      });

      allCategories = allCategories.map(c => ({
        ...c,
        liveCount: countMap[c.name] || 0,
      }));

      // Sort categories by live count (descending), keeping 0-count at end
      allCategories.sort((a, b) => {
        if (a.liveCount === 0 && b.liveCount > 0) return 1;
        if (b.liveCount === 0 && a.liveCount > 0) return -1;
        return b.liveCount - a.liveCount;
      });

      setProducts(processedProducts);
      setCategories(allCategories);
      if (isInitial) setLoading(false);
    } catch (err) {
      console.error('Failed to load store data:', err);
      setError(err.message);
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    // Real-time bidirectional synchronization: refetch on window focus or via periodic interval
    const handleFocus = () => loadData(false);
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => loadData(false), 15000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [loadData]);

  // Build category→products index
  const categoryIndex = useMemo(() => {
    const index = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      if (!index[cat]) index[cat] = [];
      index[cat].push(p);
    });
    return index;
  }, [products]);

  // Search products by name (simple case-insensitive substring match)
  const searchProducts = useCallback((query) => {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);
    return products.filter(p => {
      const name = p.name.toLowerCase();
      return terms.every(term => name.includes(term));
    });
  }, [products]);

  // Get products by category name
  const getProductsByCategory = useCallback((categoryName) => {
    return categoryIndex[categoryName] || [];
  }, [categoryIndex]);

  // Get single product by ID
  const getProduct = useCallback((id) => {
    const decodedId = decodeURIComponent(id);
    return products.find(p => p.id === decodedId) || null;
  }, [products]);

  // Get featured categories (top 8 by product count)
  const featuredCategories = useMemo(() => {
    return categories.filter(c => c.liveCount > 0).slice(0, 8);
  }, [categories]);

  const value = useMemo(() => ({
    products,
    categories,
    loading,
    error,
    config: CONFIG,
    searchProducts,
    getProductsByCategory,
    getProduct,
    featuredCategories,
    categoryIndex,
    refreshData: () => loadData(false),
  }), [products, categories, loading, error, searchProducts, getProductsByCategory, getProduct, featuredCategories, categoryIndex, loadData]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

export default useStore;
