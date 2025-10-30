import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 1. Import useSearchParams
import { useParams, Link, useSearchParams } from 'react-router-dom';
import DepartmentList from '../components/DepartmentList'; 

const API_URL = 'http://localhost:4000/api/departments';
const LIMIT = 10; // 2. Define our limit

function DepartmentPage() {
  const [department, setDepartment] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true); // 3. Add hasMore state
  
  const { id } = useParams(); 
  
  // 4. Get page from URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading for page changes
      setError(null);
      try {
        // Fetch department details (for name)
        const deptResponse = await axios.get(`${API_URL}/${id}`);
        setDepartment(deptResponse.data);

        // 5. Fetch PAGINATED products
        const productsResponse = await axios.get(
          `${API_URL}/${id}/products?page=${page}&limit=${LIMIT}`
        );
        setProducts(productsResponse.data);

        // 6. Update hasMore logic
        setHasMore(productsResponse.data.length === LIMIT);

      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Department not found.');
        } else {
          setError('Failed to load data. Please try again.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, page]); // 7. Add page to dependency array

  // 8. Add page handlers
  const handleNextPage = () => {
    setSearchParams({ page: page + 1 });
  };

  const handlePrevPage = () => {
    setSearchParams({ page: page - 1 });
  };

  if (loading) {
    return <div className="loading">Loading department...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!department) {
    return <div className="error">Department data is unavailable.</div>;
  }

  return (
    <div className="department-page-container">
      <DepartmentList />

      <header className="department-header">
        <h2>{department.name}</h2>
        {/* 9. Update header to show page number */}
        <p>Showing {products.length} products (Page {page})</p>
      </header>
      
      {products.length === 0 && !loading ? (
        <p>No products found in this department.</p>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => {
              const productName = product.name || 'Untitled Product';
              const placeholderText = product.name ? product.name.replace(/\s/g, '+') : 'No+Name';

              return (
                <div key={product.id} className="product-card">
                  <img 
                    src={`https://via.placeholder.com/150?text=${placeholderText}`} 
                    alt={productName} 
                    className="product-image"
                  />
                  <h3 className="product-name">{productName}</h3>
                  <p className="product-brand">{product.brand}</p>
                  <p className="product-price">${Number(product.retail_price).toFixed(2)}</p>
                  
                  {/* 10. Update the 'from' link to include page */}
                  <Link 
                    to={`/products/${product.id}`} 
                    state={{ from: `/departments/${id}?page=${page}` }}
                    className="btn-view-details"
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>

          {/* 11. Add pagination controls */}
          <div className="pagination-controls">
            <button 
              onClick={handlePrevPage} 
              disabled={page === 1}
            >
              &larr; Previous
            </button>
            <span>Page {page}</span>
            <button 
              onClick={handleNextPage}
              disabled={!hasMore}
            >
              Next &rarr;
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DepartmentPage;