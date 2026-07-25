import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StorefrontApp from './StorefrontApp';
import AdminApp from './admin/AdminApp';

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<StorefrontApp />} />
    </Routes>
  );
}

export default App;
