// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DepartmentPage from './pages/DepartmentPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>My E-Commerce Store</h1>
        </header>
        <main>
          <Routes>
            {/* Route for the Product List Page */}
            <Route path="/" element={<ProductListPage />} />
            
            {/* Route for the Product Detail Page */}
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/departments/:id" element={<DepartmentPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>© 2025 E-Commerce</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;