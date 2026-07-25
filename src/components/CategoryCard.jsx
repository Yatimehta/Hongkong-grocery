import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

// Category icons (simple inline SVGs for common grocery categories)
const CATEGORY_ICONS = {
  'Frozen': '❄️',
  'Freeze': '🧊',
  'Fresh': '🥬',
  'Fresh / Vegetable': '🥦',
  'Vegetable': '🥕',
  'Rice': '🍚',
  'Flour': '🌾',
  'Masala': '🌶️',
  'Spices/Condiments': '🧂',
  'Whole Masala': '🫚',
  'Powder': '🥣',
  'Lentils / Beans': '🫘',
  'Dal': '🫘',
  'Cooking Oil': '🫒',
  'Speciality Oil': '🧴',
  'Tea / Coffee': '☕',
  'Beverages / Juice': '🧃',
  'Beverages / Soft Drinks': '🥤',
  'Milk': '🥛',
  'Dairy Products': '🧀',
  'Dairy Products / Ghee': '🧈',
  'Snack': '🍿',
  'Snacks': '🍪',
  'Packaged Snacks': '🥨',
  'Biscuit': '🍪',
  'Beauty': '💄',
  'Health / Beauty': '✨',
  'Health': '💊',
  'Medicine': '💊',
  'Hair Oil': '💇',
  'Sauce': '🫙',
  'Cooking Sauces': '🥫',
  'Pickle': '🫙',
  'Sugar': '🍬',
  'Salt': '🧂',
  'Nuts': '🥜',
  'Date': '🌴',
  'Sweet': '🍯',
  'Bakery / Toast Rusk': '🍞',
  'Flatbread': '🫓',
  'Pasta & Noodles': '🍝',
  'Noodle': '🍜',
  'Ready / Canned Food': '🥫',
  'Ready-to-Eat': '🍱',
  'Fresh Food / Meals': '🍛',
  'Fresh Food / Desserts': '🍮',
  'Packaged Sweets/Snacks': '🍫',
  'Packaged Sweets/Desserts': '🎂',
  'Tools': '🔧',
  'Tool': '🛠️',
  'Kitchen Tools / Utensils': '🍴',
  'Cards': '💳',
  'Spread & Jams': '🍯',
  'Gift / Specials': '🎁',
  'Adding': '➕',
  'Leisure': '🎮',
  'Other': '📦',
  'Uncategorized': '📋',
  'Pre-Order': '📋',
  'Promotional': '🏷️',
  'Sale': '🏷️',
  'Donation': '❤️',
  'Flavoring Agent': '🧪',
};

export default function CategoryCard({ category }) {
  const icon = CATEGORY_ICONS[category.name] || '🛒';

  return (
    <Link
      to={`/category/${encodeURIComponent(category.name)}`}
      className="category-card"
      id={`category-${category.id}`}
    >
      <div className="category-card-icon">{icon}</div>
      <div className="category-card-info">
        <h3 className="category-card-name">{category.name}</h3>
        <span className="category-card-count">{category.liveCount} product{category.liveCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="category-card-arrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </Link>
  );
}
