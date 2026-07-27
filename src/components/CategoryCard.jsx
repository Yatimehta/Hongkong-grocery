import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './CategoryCard.css';

// Curated high-resolution grocery photography mapped to category names
const CATEGORY_IMAGES = {
  'Frozen': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?q=80&w=600&auto=format&fit=crop',
  'Freeze': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?q=80&w=600&auto=format&fit=crop',
  'Fresh': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop',
  'Fresh / Vegetable': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop',
  'Vegetable': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=600&auto=format&fit=crop',
  'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
  'Flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
  'Masala': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
  'Spices/Condiments': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
  'Whole Masala': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
  'Powder': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
  'Lentils / Beans': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?q=80&w=600&auto=format&fit=crop',
  'Dal': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?q=80&w=600&auto=format&fit=crop',
  'Cooking Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop',
  'Speciality Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop',
  'Tea / Coffee': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
  'Beverages / Juice': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop',
  'Beverages / Soft Drinks': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop',
  'Milk': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
  'Dairy Products': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
  'Dairy Products / Ghee': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
  'Snack': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=600&auto=format&fit=crop',
  'Snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=600&auto=format&fit=crop',
  'Packaged Snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=600&auto=format&fit=crop',
  'Biscuit': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=600&auto=format&fit=crop',
  'Sauce': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=600&auto=format&fit=crop',
  'Cooking Sauces': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=600&auto=format&fit=crop',
  'Pickle': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=600&auto=format&fit=crop',
  'Nuts': 'https://images.unsplash.com/photo-1536591375315-1b836881d643?q=80&w=600&auto=format&fit=crop',
  'Sweet': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop',
  'Bakery / Toast Rusk': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
  'Ready / Canned Food': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
  'Ready-to-Eat': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
  'Fresh Food / Meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop';

export default function CategoryCard({ category }) {
  const bgImage = category.image || CATEGORY_IMAGES[category.name] || DEFAULT_IMAGE;
  const count = category.liveCount !== undefined ? category.liveCount : category.count;

  return (
    <Link
      to={`/category/${encodeURIComponent(category.name)}`}
      className="category-card-modern"
      id={`category-${category.id || category.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
    >
      <img
        src={bgImage}
        alt={category.name}
        className="category-card-bg"
        loading="lazy"
      />
      <div className="category-card-overlay" />
      <div className="category-card-content">
        <div className="category-card-top">
          {count !== undefined && (
            <span className="category-card-badge">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        <div className="category-card-bottom">
          <h3 className="category-card-title">{category.name}</h3>
          <div className="category-card-action">
            <span>Explore</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}
