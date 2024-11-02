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

app.get("/:table", (req, res) => {
  const { table } = req.params;
  const validTables = [
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];

  if (!validTables.includes(table)) {
    return res.status(400).json({ error: "Invalid table name." });
  }

  const sql = `SELECT * FROM ${table}`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ items: rows });
  });
});

app.post("/:table", (req, res) => {
  const { table } = req.params;
  const { name, quantity, date_added } = req.body;
  const validTables = [
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];
  if (!validTables.includes(table)) {
    return res.status(400).json({ error: "Invalid table name." });
  }
  const sql = `INSERT INTO ${table} (name, quantity, date_added) VALUES(?, ?, ?)`;
  db.run(sql, [name, quantity, date_added], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, date_added });
  });
});

app.delete("/:table/:id", (req, res) => {
  const { table, id } = req.params;
  const validTables = [
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];
  if (!validTables.includes(table)) {
    return res.status(400).json({ error: "Invalid table name." });
  }
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  db.run(sql, id, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  db.get(`SELECT COUNT(*) AS count FROM ${table}`, (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (row.count === 0) {
      db.run(
        "UPDATE sqlite_sequence SET seq = 0 WHERE name = ?",
        [table], // Escape elérés a table változóhoz.
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
  const sql = "UPDATE fridge_items SET quantity = ? WHERE id = ?";
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

// app.get("/freezer_items", (req, res) => {
//   db.all("SELECT * FROM freezer_items", [], (err, rows) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({ items: rows });
//   });
// });

// app.post("/freezer_items", (req, res) => {
//   const { name, quantity, date_added } = req.body;
//   const sql =
//     "INSERT INTO freezer_items (name, quantity, date_added) VALUES(?, ?, ?)";

//   db.run(sql, [name, quantity, date_added], function (err) {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({ id: this.lastID, name, quantity, date_added });
//   });
// });

// app.delete("/freezer_items/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = "DELETE FROM freezer_items WHERE id = ?";

//   db.run(sql, id, function (err) {
//     if (err) {
//       res.status(400).json({ err: err.message });
//       return;
//     }

//     // Ellenőrizzük, hogy a tábla üres-e
//     db.get("SELECT COUNT(*) AS count FROM freezer_items", (err, row) => {
//       if (row.count === 0) {
//         db.run(
//           "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'freezer_items'",
//           (err) => {
//             if (err) {
//               res.status(400).json({ err: err.message });
//               return;
//             }
//             // Visszajelzés a törlésről és a reset-ről
//             res.json({ message: "Item deleted and sequence reset", id });
//           }
//         );
//       } else {
//         // Ha nem üres, csak a törlés visszajelzése
//         res.json({ message: "Item deleted", id });
//       }
//     });
//   });
// });

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

// app.get("/chamber_items", (req, res) => {
//   db.all("SELECT * FROM chamber_items", [], (err, rows) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({ items: rows });
//   });
// });

// app.post("/chamber_items", (req, res) => {
//   const { name, quantity, date_added } = req.body;
//   const sql =
//     "INSERT INTO chamber_items (name, quantity, date_added) VALUES(?, ?, ?)";
//   db.run(sql, [name, quantity, date_added], function (err) {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({ id: this.lastID, name, quantity, date_added });
//   });
// });

// app.delete("/chamber_items/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = "DELETE FROM chamber_items WHERE id = ?";

//   db.run(sql, id, function (err) {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     db.get("SELECT COUNT(*) AS count FROM chamber_items", (err, row) => {
//       if (row.count === 0) {
//         db.run(
//           "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'chamber_items'",
//           (err) => {
//             if (err) {
//               res.status(400).json({ err: err.message });
//               return;
//             }
//             // Visszajelzés a törlésről és a reset-ről
//             res.json({ message: "Item deleted and sequence reset", id });
//           }
//         );
//       } else {
//         // Ha nem üres, csak a törlés visszajelzése
//         res.json({ message: "Item deleted", id });
//       }
//     });
//   });
// });

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

// app.get("/others_items", (req, res) => {
//   db.all("SELECT * FROM others_items", [], (err, rows) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({ items: rows });
//   });
// });

// app.post("/others_items", (req, res) => {
//   const { name, quantity, date_added } = req.body;
//   const sql =
//     "INSERT INTO others_items (name, quantity, date_added) VALUES(?, ?, ?)";
//   db.run(sql, [name, quantity, date_added], function (err) {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({ id: this.lastID, name, quantity, date_added });
//   });
// });

// app.delete("/others_items/:id", (req, res) => {
//   const { id } = req.params;
//   const sql = "DELETE FROM others_items WHERE id = ?";

//   db.run(sql, id, function (err) {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     db.get("SELECT COUNT(*) AS count FROM others_items", (err, row) => {
//       if (row.count === 0) {
//         db.run(
//           "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'others_items'",
//           (err) => {
//             if (err) {
//               res.status(400).json({ err: err.message });
//               return;
//             }
//             // Visszajelzés a törlésről és a reset-ről
//             res.json({ message: "Item deleted and sequence reset", id });
//           }
//         );
//       } else {
//         // Ha nem üres, csak a törlés visszajelzése
//         res.json({ message: "Item deleted", id });
//       }
//     });
//   });
// });

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

// app.get("/shoppingList_items", (req, res) => {
//   db.all("SELECT * FROM shoppingList_items", [], (err, rows) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({ items: rows });
//   });
// });

// app.post("/shoppingList_items", (req, res) => {
//   const { name, quantity, date_added } = req.body;
//   console.log(req.body);
//   const sql =
//     "INSERT INTO shoppingList_items (name, quantity, date_added) VALUES(?, ?, ?)";
//   db.run(sql, [name, quantity, date_added], function (err) {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({ id: this.lastID, name, quantity, date_added });
//   });
// });

// app.delete("/shoppingList_items/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = "DELETE FROM shoppingList_items WHERE id = ?";

//   db.run(sql, id, function (err) {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     db.get("SELECT COUNT(*) AS count FROM shoppingList_items", (err, row) => {
//       if (row.count === 0) {
//         db.run(
//           "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'shoppingList_items'",
//           (err) => {
//             if (err) {
//               res.status(400).json({ err: err.message });
//               return;
//             }
//             // Visszajelzés a törlésről és a reset-ről
//             res.json({ message: "Item deleted and sequence reset", id });
//           }
//         );
//       } else {
//         // Ha nem üres, csak a törlés visszajelzése
//         res.json({ message: "Item deleted", id });
//       }
//     });
//   });
// });

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

app.post("/moveto_sl", (req, res) => {
  const { itemName, newQuantity, date, sourceTable, targetTable } = req.body;
  const validTables = [
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];

  if (
    !validTables.includes(sourceTable) &&
    !validTables.includes(targetTable)
  ) {
    return res.status(400).json({ error: "Invalid source or target table." });
  }

  const sql = `SELECT * FROM ${sourceTable} WHERE name = ?`;

  db.get(sql, [itemName], function (err, transferItem) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!transferItem) {
      return res
        .status(400)
        .json({ error: "Item not found in the fridge_items." });
    }
    const sql2 = `SELECT * FROM ${targetTable} WHERE name = ?`;
    db.get(sql2, [itemName], function (err, targetItem) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      // Ha az elem megtalálható az SL-ben.
      if (targetItem) {
        // Mennyiség kivonása és ellenőrzés, hogy ne legyen hiba, ha nincs találat
        const numReg = /\d+(\.\d+)?/;
        const tempQty = newQuantity.match(numReg);

        if (!tempQty) {
          return res.status(400).json({ error: "Invalid quantity format." });
        }

        const qtyToAdd = Number(tempQty[0]);
        const currentQtyMatch = targetItem.quantity.match(numReg);
        const currentQty = currentQtyMatch ? Number(currentQtyMatch[0]) : 0;
        const newTotalQty = currentQty + qtyToAdd;
        const unit = newQuantity.replace(numReg, "").trim();

        const validQty = `${newTotalQty} ${unit}`;

        const sql3 = `UPDATE ${targetTable} SET quantity = ?, date_added = ? WHERE name = ?`;
        db.run(sql3, [validQty, date, itemName], function (err) {
          if (err) {
            return res.status(400).json({ error: err.message });
          }
          res.json({ message: "Item quantity updated successfully." });
        });
      } else {
        // Ha nem, létrehozzuk az elemet.
        const numRegex = /\d+(\.\d+)?/; // Egy tömböt ad vissza.
        const qty = newQuantity.match(numRegex)[0];
        const unit = newQuantity.replace(Number.parseFloat(newQuantity), "");
        const validQty = `${qty} ${unit}`;
        console.log("QTY ami eddig nem jelent meg: ", validQty);
        const sql4 = `INSERT INTO ${targetTable} (name, quantity, date_added) VALUES (?, ?, ?)`;
        db.run(sql4, [transferItem.name, validQty, date], function (err) {
          if (err) {
            return res.status(400).json({ error: err.message });
          }
          res.json({ message: "Item moved to shopping list successfully." });
        });
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
