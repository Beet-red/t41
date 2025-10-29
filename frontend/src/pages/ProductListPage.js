// src/pages/ProductListPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

// We fetch data from our backend API
const API_URL = 'http://localhost:4000/api/products';
const LIMIT = 10; // Define our limit

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const [hasMore, setHasMore] = useState(true); // <-- 2. ADD 'HASMORE' STATE

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}?page=${page}&limit=${LIMIT}`);
        setProducts(response.data);
        setHasMore(response.data.length === LIMIT);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]); // 5. ADD 'PAGE' TO DEPENDENCY ARRAY

  // --- Button Handlers ---
  const handleNextPage = () => {
    setSearchParams({ page: page + 1 });
  };

  const handlePrevPage = () => {
    setSearchParams({ page: page - 1 });
  };


  // --- Handle Error State ---
  if (error) {
    return <div className="error">{error}</div>;
  }

  // --- Display Product List ---
  return (
    <div className="product-list-container">
      <h2>Products</h2>

      {/* Show loading text only when loading */}
      {loading && <div className="loading">Loading products...</div>}

      {/* Show product grid only when NOT loading */}
      {!loading && (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img 
                src={`https://via.placeholder.com/150?text=${product.name.replace(/\s/g, '+')}`} 
                alt={product.name} 
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-brand">{product.brand}</p>
              <p className="product-price">${Number(product.retail_price).toFixed(2)}</p>
              <Link 
                to={`/products/${product.id}`} 
                state={{ fromPage: page }}  // <-- PASS THE CURRENT PAGE
                className="btn-view-details"
              >
                View Details
              </Link>   
            </div>
          ))}
        </div>
      )}
      
      {/* // ----------------------------------------------------
      // 6. ADD PAGINATION CONTROLS
      // ----------------------------------------------------
      */}
      <div className="pagination-controls">
        <button 
          onClick={handlePrevPage} 
          disabled={page === 1} // Disable on first page
        >
          &larr; Previous
        </button>
        <span>Page {page}</span>
        <button 
          onClick={handleNextPage}
          disabled={!hasMore} // Disable if no more items
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}

export default ProductListPage;