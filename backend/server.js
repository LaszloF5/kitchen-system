const express = require("express");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database: ", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS fridge_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        date_added TEXT NOT NULL
        )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS freezer_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        date_added TEXT NOT NULL
        )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS chamber_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        date_added TEXT NOT NULL
        )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS others_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        date_added TEXT NOT NULL)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS shoppingList_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        date_added TEXT NOT NULL)`
  );
});

// fridge items

app.get("/fridge_items", (req, res) => {
  db.all("SELECT * FROM fridge_items", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ items: rows });
  });
});

app.post("/fridge_items", (req, res) => {
  const { name, quantity, date_added } = req.body;
  const sql =
    "INSERT INTO fridge_items (name, quantity, date_added) VALUES(?, ?, ?)";
  db.run(sql, [name, quantity, date_added], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, date_added });
  });
});

// freezer items

app.get("/freezer_items", (req, res) => {
  db.all("SELECT * FROM freezer_items", [], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ items: rows });
  });
});

app.post("/freezer_items", (req, res) => {
  const { name, quantity, date_added } = req.body;
  const sql =
    "INSERT INTO freezer_items (name, quantity, date_added) VALUES(?, ?, ?)";
  db.run(sql, [name, quantity, date_added], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, date_added });
  });
});

// chamber items

app.get("/chamber_items", (req, res) => {
  db.all("SELECT * FROM chamber_items", [], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ items: rows });
  });
});

app.post("/chamber_items", (req, res) => {
  const { name, quantity, date_added } = req.body;
  const sql =
    "INSERT INTO chamber_items (name, quantity, date_added) VALUES(?, ?, ?)";
  db.run(sql, [name, quantity, date_added], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, date_added });
  });
});

// others items

app.get("/others_items", (req, res) => {
  db.all("SELECT * FROM others_items", [], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ items: rows });
  });
});

app.post("/others_items", (req, res) => {
  const { name, quantity, date_added } = req.body;
  const sql =
    "INSERT INTO other_items (name, quantity, date_added) VALUES(?, ?, ?)";
  db.run(sql, [name, quantity, date_added], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, date_added });
  });
});

// shopping list items

app.get("/shoppingList_items", (req, res) => {
  db.all("SELECT * FROM others_items", [], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ items: rows });
  });
});

app.post("/shoppingList_items", (req, res) => {
  const { name, quantity, date_added } = req.body;
  const sql =
    "INSERT INTO shoppingList_items (name, quantity, date_added) VALUES(?, ?, ?)";
  db.run(sql, [name, quantity, date_added], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, date_added });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
