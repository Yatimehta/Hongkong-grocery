import React from 'react';

export default function Placeholder({ size = 200, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" fill="#f0f9ed" />
      {/* Subtle grid pattern */}
      <pattern id="placeholder-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d4eece" strokeWidth="0.5" />
      </pattern>
      <rect width="200" height="200" fill="url(#placeholder-grid)" opacity="0.5" />
      {/* WS monogram */}
      <ellipse cx="100" cy="96" rx="38" ry="34" fill="none" stroke="#5CB349" strokeWidth="1.5" opacity="0.4" />
      <text
        x="100"
        y="106"
        textAnchor="middle"
        fontFamily="'Brush Script MT','Segoe Script',cursive"
        fontSize="36"
        fill="#5CB349"
        opacity="0.45"
      >
        WS
      </text>
      {/* "No Image" text */}
      <text
        x="100"
        y="155"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="11"
        fill="#8A9484"
        fontWeight="500"
      >
        No image available
      </text>
    </svg>
  );
}
