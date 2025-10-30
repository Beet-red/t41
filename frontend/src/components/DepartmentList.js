import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, NavLink } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api/departments';

function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(API_URL);
        setDepartments(response.data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
        setError("Could not load departments.");
      }
    };
    fetchDepartments();
  }, []);

  if (error) {
    return <div className="department-nav error">{error}</div>;
  }

  return (
    <nav className="department-nav">
      <strong>Filter by Department:</strong>
      <NavLink 
        to="/" 
        className={({ isActive }) => (isActive && window.location.pathname === '/') ? 'active' : ''}
        end
      >
        All Products
      </NavLink>
      {departments.map(dept => (
        <NavLink 
          key={dept.id} 
          to={`/departments/${dept.id}`}
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          {dept.name} ({dept.product_count})
        </NavLink>
      ))}
    </nav>
  );
}

export default DepartmentList;