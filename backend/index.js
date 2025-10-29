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
      'SELECT id, name, brand, retail_price, department FROM products LIMIT $1 OFFSET $2',
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
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

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

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});