const express = require("express");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const app = express();
const PORT = 5500;

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
        quantity TEXT NOT NULL,
        date_added TEXT NOT NULL
        )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS freezer_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity TEXT NOT NULL,
        date_added TEXT NOT NULL
        )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS chamber_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity TEXT NOT NULL,
        date_added TEXT NOT NULL
        )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS others_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity TEXT NOT NULL,
        date_added TEXT NOT NULL)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS shoppingList_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity TEXT NOT NULL,
        date_added TEXT NOT NULL)`
  );
});

app.get("/", (req, res) => {
  res.send("The server is running.");
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

app.delete("/fridge_items/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM fridge_items WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
  });

  db.get("SELECT COUNT(*) AS count FROM fridge_items", (err, row) => {
    if (row.count === 0) {
      db.run(
        "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'fridge_items'",
        (err) => {
          if (err) {
            res.status(400).json({ err: err.message });
            return;
          }
          res.json({ message: "Item deleted and sequence reset", id });
        }
      );
    } else {
      res.json({ message: "Item deleted", id });
    }
  });
});

app.put("/fridge_items/:id", (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const sql = "UPDATE fridge_items SET quantity = ? WHERE id = ?"
  const regex = /\d+(\.\d+)?/;
  const qty = Number(...quantity.match(regex));
  const unit = quantity.replace(Number.parseFloat(quantity), "");
  const validQty = `${qty} ${unit}`;

  db.run(sql, [validQty, id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Item quantity updated", id, quantity });
  });
});

// freezer items

app.get("/freezer_items", (req, res) => {
  db.all("SELECT * FROM freezer_items", [], (err, rows) => {
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

app.delete("/freezer_items/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM freezer_items WHERE id = ?";

  db.run(sql, id, function (err) {
    if (err) {
      res.status(400).json({ err: err.message });
      return;
    }

    // Ellenőrizzük, hogy a tábla üres-e
    db.get("SELECT COUNT(*) AS count FROM freezer_items", (err, row) => {
      if (row.count === 0) {
        db.run(
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'freezer_items'",
          (err) => {
            if (err) {
              res.status(400).json({ err: err.message });
              return;
            }
            // Visszajelzés a törlésről és a reset-ről
            res.json({ message: "Item deleted and sequence reset", id });
          }
        );
      } else {
        // Ha nem üres, csak a törlés visszajelzése
        res.json({ message: "Item deleted", id });
      }
    });
  });
});

app.put("/freezer_items/:id", (req, res) => {
  console.log("PUT request received"); // Ez a lognak meg kell jelennie
  const { id } = req.params;
  const { quantity } = req.body;
  const regex = /\d+(\.\d+)?/;
  const qty = Number(...quantity.match(regex));
  const unit = quantity.replace(Number.parseFloat(quantity), "");
  const validQty = `${qty} ${unit}`;

  // Ellenőrzés: logold az ID-t és a quantity-t
  console.log(`Updating item with ID: ${id}, new quantity: ${quantity}`);

  const sql = "UPDATE freezer_items SET quantity = ? WHERE id = ?";

  db.run(sql, [validQty, id], function (err) {
    if (err) {
      console.log("Error in SQL:", err.message); // Ha hiba történik az SQL futásnál, ez megjelenik
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({ message: "Quantity updated successfully", id, quantity });
  });
});

// chamber items

app.get("/chamber_items", (req, res) => {
  db.all("SELECT * FROM chamber_items", [], (err, rows) => {
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

app.delete("/chamber_items/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM chamber_items WHERE id = ?";

  db.run(sql, id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    db.get("SELECT COUNT(*) AS count FROM chamber_items", (err, row) => {
      if (row.count === 0) {
        db.run(
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'chamber_items'",
          (err) => {
            if (err) {
              res.status(400).json({ err: err.message });
              return;
            }
            // Visszajelzés a törlésről és a reset-ről
            res.json({ message: "Item deleted and sequence reset", id });
          }
        );
      } else {
        // Ha nem üres, csak a törlés visszajelzése
        res.json({ message: "Item deleted", id });
      }
    });
  });
});

app.put("/chamber_items/:id", (req, res) => {
  const { id } = req.params;
  console.log("ID param:", id);
  const { quantity } = req.body;
  const regex = /\d+(\.\d+)?/;
  const qty = Number(...quantity.match(regex));
  const unit = quantity.replace(Number.parseFloat(quantity), "");
  const validQty = `${qty} ${unit}`;

  // Ellenőrzés: logold az ID-t és a quantity-t
  console.log(`Updating item with ID: ${id}, new quantity: ${quantity}`);

  const sql = "UPDATE chamber_items SET quantity = ? WHERE id = ?";

  db.run(sql, [validQty, id], function (err) {
    if (err) {
      console.log("Error in SQL:", err.message); // Ha hiba történik az SQL futásnál, ez megjelenik
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Quantity updated successfully", id, quantity });
  });
});

// others items

app.get("/others_items", (req, res) => {
  db.all("SELECT * FROM others_items", [], (err, rows) => {
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
    "INSERT INTO others_items (name, quantity, date_added) VALUES(?, ?, ?)";
  db.run(sql, [name, quantity, date_added], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, date_added });
  });
});

app.delete("/others_items/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM others_items WHERE id = ?";

  db.run(sql, id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    db.get("SELECT COUNT(*) AS count FROM others_items", (err, row) => {
      if (row.count === 0) {
        db.run(
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'others_items'",
          (err) => {
            if (err) {
              res.status(400).json({ err: err.message });
              return;
            }
            // Visszajelzés a törlésről és a reset-ről
            res.json({ message: "Item deleted and sequence reset", id });
          }
        );
      } else {
        // Ha nem üres, csak a törlés visszajelzése
        res.json({ message: "Item deleted", id });
      }
    });
  });
});

app.put("/others_items/:id", (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const regex = /\d+(\.\d+)?/;
  const qty = Number(...quantity.match(regex));
  const unit = quantity.replace(Number.parseFloat(quantity), "");
  const validQty = `${qty} ${unit}`;

  console.log(`Updating item with ID: ${id}, new quantity: ${quantity}`);

  const sql = "UPDATE others_items SET quantity = ? WHERE id = ?";

  db.run(sql, [validQty, id], function (err) {
    if (err) {
      console.log("Error in SQL:", err.message); // Ha hiba történik az SQL futásnál, ez megjelenik
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Quantity updated successfully", id, quantity });
  });
});

// shopping list items

app.get("/shoppingList_items", (req, res) => {
  db.all("SELECT * FROM shoppingList_items", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ items: rows });
  });
});

app.post("/shoppingList_items", (req, res) => {
  const { name, quantity, date_added } = req.body;
  console.log("itt a hiba: ", req.body);
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

app.delete("/shoppingList_items/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM shoppingList_items WHERE id = ?";

  db.run(sql, id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    db.get("SELECT COUNT(*) AS count FROM shoppingList_items", (err, row) => {
      if (row.count === 0) {
        db.run(
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'shoppingList_items'",
          (err) => {
            if (err) {
              res.status(400).json({ err: err.message });
              return;
            }
            // Visszajelzés a törlésről és a reset-ről
            res.json({ message: "Item deleted and sequence reset", id });
          }
        );
      } else {
        // Ha nem üres, csak a törlés visszajelzése
        res.json({ message: "Item deleted", id });
      }
    });
  });
});

app.put("/shoppingList_items/:id", (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const regex = /\d+(\.\d+)?/;
  const qty = Number(...quantity.match(regex));
  const unit = quantity.replace(Number.parseFloat(quantity), "");
  const validQty = `${qty} ${unit}`;
  const sql = "UPDATE shoppinglist_items SET quantity = ? WHERE id = ?";

  db.run(sql, [validQty, id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  res.json({ message: "Quantity updated successfully", quantity, id });
});

// Elemek mozgatása a shopping list komponensből a többi komponensbe.

app.post("/move-item", (req, res) => {
  const { id, itemName, sourceTable, targetTable } = req.body;

  const validTables = [
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];
  if (
    !validTables.includes(sourceTable) ||
    !validTables.includes(targetTable)
  ) {
    return res.status(400).json({ error: "Invalid table name." });
  }

  db.get(
    `SELECT * FROM ${sourceTable} WHERE name = ?`,
    [itemName],
    (err, sourceRow) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!sourceRow) return res.status(404).json({ error: "Item not found." });

      // Forrás mennyiség és mértékegység bontása
      const cleanedSourceQuantity = sourceRow.quantity
        .replace(/\s+/, " ")
        .trim();
      const [sourceQuantity, sourceUnit] = cleanedSourceQuantity.split(" ");
      const sourceQuantityValue = parseFloat(sourceQuantity);

      // Cél tábla lekérdezése az itemName alapján
      db.get(
        `SELECT * FROM ${targetTable} WHERE name = ?`,
        [itemName],
        (err, targetRow) => {
          if (err) return res.status(500).json({ error: err.message });

          if (targetRow) {
            // Cél mennyiség és mértékegység bontása
            const cleanedTargetQuantity = targetRow.quantity
              .replace(/\s+/, " ")
              .trim();
            const [targetQuantity, targetUnit] =
              cleanedTargetQuantity.split(" ");
            const targetQuantityValue = parseFloat(targetQuantity);

            // Ellenőrzi, hogy a mértékegységek egyeznek-e
            if (sourceUnit === targetUnit) {
              const newQuantity = sourceQuantityValue + targetQuantityValue;
              const updatedQuantity = `${newQuantity} ${targetUnit}`;

              db.run(
                `UPDATE ${targetTable} SET quantity = ? WHERE name = ?`,
                [updatedQuantity, itemName],
                function (err) {
                  if (err) return res.status(500).json({ error: err.message });

                  // Sikeres UPDATE után törli a forrástáblából
                  db.run(
                    `DELETE FROM ${sourceTable} WHERE name = ?`,
                    [itemName],
                    function (err) {
                      if (err)
                        return res.status(500).json({ error: err.message });
                      res.json({
                        message: "Item moved successfully.",
                        id: sourceRow.id,
                      });
                    }
                  );
                }
              );
            } else {
              res
                .status(400)
                .json({ error: "Unit mismatch between source and target." });
            }
          } else {
            // Ha nincs cél tábla sor, akkor beszúrja az új elemet
            db.run(
              `INSERT INTO ${targetTable} (name, quantity, date_added) VALUES (?, ?, ?)`,
              [sourceRow.name, sourceRow.quantity, sourceRow.date_added],
              function (err) {
                if (err) return res.status(500).json({ error: err.message });

                // Sikeres INSERT után törli a forrástáblából
                db.run(
                  `DELETE FROM ${sourceTable} WHERE name = ?`,
                  [itemName],
                  function (err) {
                    if (err)
                      return res.status(500).json({ error: err.message });
                    res.json({
                      message: "Item moved successfully.",
                      id: sourceRow.id,
                    });
                  }
                );
              }
            );
          }
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
