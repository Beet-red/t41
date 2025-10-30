// src/pages/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api/products';

function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // The 'id' comes from the URL (e.g., /products/10)
  const { id } = useParams();

  const location = useLocation();
  
  // 3. GET THE fromPage VALUE WE PASSED (default to 1)
  const fromPath = location.state?.from || '/';   

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        setProduct(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Product not found.');
        } else {
          setError('Failed to fetch product details.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Re-run effect if the 'id' changes

  // --- Handle Loading and Error States ---
  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return null; // Should be covered by loading/error, but good practice
  }

  // --- Display Product Details ---
  return (
    <div className="product-detail-container">
      <Link to={fromPath} className="btn-back">
        &larr; Back
      </Link>
      <div className="product-detail-content">
        <img 
          src={`https://via.placeholder.com/300?text=${product.name.replace(/\s/g, '+')}`} 
          alt={product.name} 
          className="product-detail-image"
        />
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <span className="product-detail-brand">{product.brand}</span>
          <p className="product-detail-price">${Number(product.retail_price).toFixed(2)}</p>
          <p className="product-detail-description">
            This is a placeholder description for {product.name}. 
            It belongs to the {product.department} department and {product.category} category.
          </p>
          <button className="btn-add-to-cart">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;