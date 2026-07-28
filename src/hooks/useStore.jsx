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
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processProductList = (rawList) => {
    return rawList.map(p => {
      let imgUrls = [];
      if (Array.isArray(p.image_urls) && p.image_urls.length > 0) {
        imgUrls = p.image_urls.filter(u => typeof u === 'string' && u.trim().length > 0);
      }
      if (!imgUrls.length && typeof p.images === 'string') {
        try { imgUrls = JSON.parse(p.images); } catch(e) {}
      }
      if (!imgUrls.length && Array.isArray(p.images) && p.images.length > 0) {
        imgUrls = p.images.map(img => (typeof img === 'object' && img !== null ? img.url : img)).filter(Boolean);
      }
      if (!imgUrls.length && Array.isArray(p.local_images) && p.local_images.length > 0) {
        imgUrls = p.local_images.map(img => typeof img === 'string' ? (img.startsWith('/') ? img : '/' + img) : '').filter(Boolean);
      }
      if (!imgUrls.length && typeof p.image === 'string' && p.image.trim().length > 0) {
        imgUrls = [p.image.trim()];
      }

      const primaryImage = imgUrls[0] || (typeof p.image === 'string' && p.image.trim().length > 0 ? p.image.trim() : '');

      const catName = typeof p.category === 'object' && p.category !== null 
        ? (p.category.name || 'Uncategorized')
        : (typeof p.category === 'string' && p.category ? p.category : (p.categoryName || (p.categoryObj ? p.categoryObj.name : 'Uncategorized')));

      return {
        ...p,
        id: String(p.id),
        name: p.name || p.title || 'Grocery Item',
        price: Number(p.price || 0),
        image_urls: imgUrls,
        image: primaryImage,
        available: CONFIG.SHOW_ALL_AS_AVAILABLE ? true : (p.stock > 0 || p.in_stock),
        slug: encodeURIComponent(String(p.id)),
        category: catName
      };
    });
  };

  const processCategoryList = (rawCategories, processedProds) => {
    const categoryNames = new Set(rawCategories.map(c => c.name));
    let allCategories = [...rawCategories];
    if (!categoryNames.has('Uncategorized')) {
      allCategories.push({ id: 'uncategorized', name: 'Uncategorized', product_count: 0 });
    }
    const countMap = {};
    processedProds.forEach(p => {
      const cat = p.category || 'Uncategorized';
      countMap[cat] = (countMap[cat] || 0) + 1;
    });

    allCategories = allCategories.map(c => ({
      ...c,
      liveCount: countMap[c.name] || 0,
    })).filter(c => c.liveCount > 0);

    allCategories.sort((a, b) => b.liveCount - a.liveCount);

    return allCategories;
  };

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      let productsData = [];
      let categoriesData = [];

      try {
        const [apiProdRes, apiCatRes, apiSettingsRes] = await Promise.all([
          fetch('/api/products?limit=150'), // Fast initial 150 items batch for instant load!
          fetch('/api/categories'),
          fetch('/api/settings?group=general'),
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
        if (apiSettingsRes.ok) {
          const settingsData = await apiSettingsRes.json();
          setSettings(settingsData || {});
        }
      } catch (apiErr) {
        console.log('API fetch attempt fallback to static JSON:', apiErr);
      }

      // Fallback to static JSON if DB/API failed
      if (!productsData.length) {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/data/products.json'),
          fetch('/data/categories.json'),
        ]);

        if (productsRes.ok && categoriesRes.ok) {
          productsData = await productsRes.json();
          categoriesData = await categoriesRes.json();
        }
      }

      if (productsData.length > 0) {
        const processed = processProductList(productsData);
        setProducts(processed);
        setCategories(processCategoryList(categoriesData, processed));
        if (isInitial) setLoading(false);

        // Background non-blocking hydration of full 4,200 product list
        fetch('/api/products?limit=all')
          .then(res => res.json())
          .then(fullResult => {
            const fullList = fullResult.products || fullResult.data || fullResult;
            if (Array.isArray(fullList) && fullList.length > productsData.length) {
              const fullProcessed = processProductList(fullList);
              setProducts(fullProcessed);
              setCategories(processCategoryList(categoriesData, fullProcessed));
            }
          })
          .catch(() => {});
      } else {
        if (isInitial) setLoading(false);
      }
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

  // Synonyms & Transliterations dictionary for common grocery items
  const GROCERY_SYNONYMS = useMemo(() => ({
    'jeera': ['jera', 'jira', 'zeera', 'zira', 'cumin', 'cummin'],
    'jera': ['jeera', 'jira', 'zeera', 'zira', 'cumin'],
    'jira': ['jeera', 'jera', 'zeera', 'zira', 'cumin'],
    'zeera': ['jeera', 'jera', 'jira', 'zira', 'cumin'],
    'zira': ['jeera', 'jera', 'jira', 'zeera', 'cumin'],
    'cumin': ['jeera', 'jera', 'jira', 'zeera', 'zira'],

    'turmeric': ['haldi', 'haldhi', 'haridra'],
    'haldi': ['turmeric', 'haldhi', 'haridra'],
    'haldhi': ['turmeric', 'haldi', 'haridra'],

    'coriander': ['dhania', 'dhaniya', 'daniya'],
    'dhania': ['coriander', 'dhaniya', 'daniya'],
    'dhaniya': ['coriander', 'dhania', 'daniya'],
    'daniya': ['coriander', 'dhania', 'dhaniya'],

    'atta': ['ata', 'flour', 'wheat'],
    'ata': ['atta', 'flour', 'wheat'],
    'flour': ['atta', 'ata', 'maida', 'sooji', 'suji'],
    'maida': ['flour', 'refined flour'],

    'dal': ['daal', 'dhal', 'dall', 'lentil', 'lentils', 'pulse', 'pulses'],
    'daal': ['dal', 'dhal', 'lentil', 'lentils', 'pulse'],
    'dhal': ['dal', 'daal', 'lentil', 'lentils', 'pulse'],
    'lentil': ['dal', 'daal', 'dhal', 'pulse'],
    'lentils': ['dal', 'daal', 'dhal', 'pulses'],

    'chana': ['channa', 'chole', 'choley', 'chickpea', 'chickpeas', 'gram'],
    'channa': ['chana', 'chole', 'choley', 'chickpea', 'chickpeas'],
    'chole': ['chana', 'channa', 'choley', 'chickpea', 'chickpeas'],
    'choley': ['chana', 'channa', 'chole', 'chickpea', 'chickpeas'],
    'chickpea': ['chana', 'channa', 'chole', 'choley', 'gram'],
    'chickpeas': ['chana', 'channa', 'chole', 'choley', 'gram'],

    'rice': ['basmati', 'chawal'],
    'basmati': ['rice', 'chawal'],
    'chawal': ['rice', 'basmati'],

    'ghee': ['ghi', 'clarified butter'],
    'ghi': ['ghee', 'clarified butter'],

    'cardamom': ['elaichi', 'elachi', 'ilaychi'],
    'elaichi': ['cardamom', 'elachi', 'ilaychi'],
    'elachi': ['cardamom', 'elaichi', 'ilaychi'],
    'ilaychi': ['cardamom', 'elaichi', 'elachi'],

    'clove': ['laung', 'long'],
    'laung': ['clove', 'long'],
    'long': ['clove', 'laung'],

    'cinnamon': ['dalchini'],
    'dalchini': ['cinnamon'],

    'mustard': ['rai', 'sarson'],
    'rai': ['mustard', 'sarson'],
    'sarson': ['mustard', 'rai'],

    'fenugreek': ['methi'],
    'methi': ['fenugreek'],

    'fennel': ['saunf', 'sonf'],
    'saunf': ['fennel', 'sonf'],
    'sonf': ['fennel', 'saunf'],

    'spinach': ['palak'],
    'palak': ['spinach'],

    'paneer': ['panir', 'cottage cheese'],
    'panir': ['paneer', 'cottage cheese'],

    'pickle': ['achar', 'achaar'],
    'achar': ['pickle', 'achaar'],
    'achaar': ['pickle', 'achar'],

    'jaggery': ['gur', 'gud'],
    'gur': ['jaggery', 'gud'],
    'gud': ['jaggery', 'gur'],

    'tea': ['chai', 'patti'],
    'chai': ['tea', 'patti'],

    'salt': ['namak'],
    'namak': ['salt'],

    'sugar': ['cheeni', 'chini'],
    'cheeni': ['sugar', 'chini'],

    'onion': ['piaz', 'pyaz'],
    'pyaz': ['onion', 'piaz'],

    'garlic': ['lehsun', 'lahsun'],
    'lahsun': ['garlic', 'lehsun'],

    'ginger': ['adrak'],
    'adrak': ['ginger']
  }), []);

  // Levenshtein Edit Distance algorithm for typo tolerance
  const levenshteinDistance = useCallback((a, b) => {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }, []);

  const checkFuzzyWordMatch = useCallback((searchWord, targetWord) => {
    if (!searchWord || !targetWord) return { matched: false, score: 0 };
    if (targetWord === searchWord) return { matched: true, score: 100 };
    if (targetWord.includes(searchWord)) return { matched: true, score: 85 };
    if (searchWord.includes(targetWord)) return { matched: true, score: 80 };

    // Check synonym matches
    const syns = GROCERY_SYNONYMS[searchWord] || [];
    if (syns.some(s => targetWord.includes(s) || s.includes(targetWord))) {
      return { matched: true, score: 75 };
    }

    // Levenshtein edit distance check (typo tolerance)
    if (searchWord.length >= 3 && targetWord.length >= 3) {
      const maxDist = searchWord.length > 5 ? 2 : 1;
      const dist = levenshteinDistance(searchWord, targetWord);
      if (dist <= maxDist) {
        return { matched: true, score: 60 - dist * 10 };
      }
    }

    return { matched: false, score: 0 };
  }, [GROCERY_SYNONYMS, levenshteinDistance]);

  // Typo-tolerant, synonym-aware fuzzy search
  const searchProducts = useCallback((query) => {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const searchTerms = q.split(/\s+/);

    const scored = [];

    for (const p of products) {
      const name = (p.name || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      const fullText = `${name} ${category} ${description}`;
      const targetWords = fullText.split(/[^a-z0-9]+/);

      let matchedTermsCount = 0;
      let totalScore = 0;

      // Direct phrase match bonus
      if (name.includes(q)) {
        totalScore += 500;
      }

      for (const term of searchTerms) {
        if (name.includes(term)) {
          matchedTermsCount++;
          totalScore += 120;
          continue;
        }

        let termMatched = false;
        let maxTermScore = 0;

        for (const word of targetWords) {
          if (!word || word.length < 2) continue;
          const res = checkFuzzyWordMatch(term, word);
          if (res.matched) {
            termMatched = true;
            if (res.score > maxTermScore) maxTermScore = res.score;
          }
        }

        if (termMatched) {
          matchedTermsCount++;
          totalScore += maxTermScore;
        }
      }

      // Require all search terms to match either substring, synonym, or fuzzy Levenshtein
      if (matchedTermsCount === searchTerms.length) {
        scored.push({ product: p, score: totalScore });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product);
  }, [products, checkFuzzyWordMatch]);

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
    settings,
    loading,
    error,
    config: CONFIG,
    searchProducts,
    getProductsByCategory,
    getProduct,
    featuredCategories,
    categoryIndex,
    refreshData: () => loadData(false),
  }), [products, categories, settings, loading, error, searchProducts, getProductsByCategory, getProduct, featuredCategories, categoryIndex, loadData]);

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
