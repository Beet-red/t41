// --- Imports ---
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config(); // Load .env file
const cors = require('cors');

// --- App & DB Initialization ---
const app = express();
const port = process.env.PORT || 4000;

// Create PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- API Endpoints ---

// GET /api/products - List all products (with pagination)
app.get('/api/products', async (req, res) => {
  // Simple pagination: ?page=1&limit=10
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { rows } = await pool.query(
      `SELECT
          p.id,
          p.name,
          p.brand,
          p.retail_price,
          d.name AS department  -- Get name from departments table, but alias it as 'department'
       FROM products p
       JOIN departments d ON p.department_id = d.id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/products/{id} - Get a specific product by ID
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  // --- Error Handling: Invalid ID ---
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid product ID. Must be an integer.' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
          p.*, 
          d.name AS department  -- Get name from departments table, but alias it as 'department'
       FROM products p
       JOIN departments d ON p.department_id = d.id
       WHERE p.id = $1`,
      [id]
    );
    // --- Error Handling: Product Not Found ---
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.get('/api/departments', async (req, res) => {
  try {
    // This query joins departments with products, counts the products
    // for each department, and groups the results.
    const query = `
      SELECT 
        d.id, 
        d.name, 
        COUNT(p.id) AS product_count
      FROM departments d
      LEFT JOIN products p ON d.id = p.department_id
      GROUP BY d.id, d.name
      ORDER BY d.name;
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/departments/:id', async (req, res) => {
  const { id } = req.params;

  // --- Error Handling: Invalid ID ---
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid department ID. Must be an integer.' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);

    // --- Error Handling: Department Not Found ---
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/departments/{id}/products - Get all products in a department
// GET /api/departments/{id}/products - Get all products in a department (NOW WITH PAGINATION)
app.get('/api/departments/:id/products', async (req, res) => {
  const { id } = req.params;
  
  // 1. Get pagination params from query string
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // --- Error Handling: Invalid ID ---
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid department ID. Must be an integer.' });
  }

  try {
    // Check if the department exists
    const deptCheck = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    
    if (deptCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // 2. Update the query to use LIMIT and OFFSET
    const { rows: products } = await pool.query(
      'SELECT id, name, brand, retail_price FROM products WHERE department_id = $1 LIMIT $2 OFFSET $3',
      [id, limit, offset] // 3. Pass params to query
    );

    // Return the list of products for the requested page
    res.status(200).json(products);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});