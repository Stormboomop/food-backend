const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to database
const db = new sqlite3.Database('food.db');

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  username TEXT UNIQUE,
  password TEXT
)`);

// Create orders table
db.run(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  items TEXT,
  total INTEGER,
  date TEXT
)`);


// Signup API
app.post('/api/signup', (req, res) => {
  const { name, username, password } = req.body;
  db.run(`INSERT INTO users (name, username, password) VALUES (?, ?, ?)`,
    [name, username, password],
    function (err) {
      if (err) return res.status(400).json({ error: "Username already exists" });
      res.json({ message: "User created!", userId: this.lastID });
    });
});

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (err || !row) return res.status(401).json({ error: "Invalid credentials" });
      res.json({ message: "Login successful", user: row });
    });
});

// Save new order
app.post('/api/orders', (req, res) => {
  const { username, items, total } = req.body;
  const date = new Date().toISOString();

  db.run(`INSERT INTO orders (username, items, total, date) VALUES (?, ?, ?, ?)`,
    [username, JSON.stringify(items), total, date],
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to save order." });
      res.json({ message: "Order saved!", orderId: this.lastID });
    });
});

app.get('/api/orders/:username', (req, res) => {
  const { username } = req.params;
  db.all(`SELECT * FROM orders WHERE username = ?`, [username], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch orders." });
    res.json(rows);
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
