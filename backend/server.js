const express = require("express");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const app = express();
const PORT = 5500;
const bcrypt = require("bcrypt");

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
    `CREATE TABLE IF NOT EXISTS register (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL)`
  );
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

app.post("/register", async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  console.log("userName: ", userName, "password: ", password);

  try {
    // Ellenőrizze, hogy a felhasználónév már létezik-e
    const existingUser = await getUserByUserName(userName);
    if (existingUser) {
      return res.status(400).json({ error: "Felhasználónév már foglalt." });
    }

    await registerUser(userName, password);
    res.status(201).send("Sikeres regisztráció.");
  } catch (err) {
    res.status(500).send("Hiba történt a regisztráció során.");
  }

  async function getUserByUserName(userName) {
    const sql = `SELECT * FROM register WHERE userName = ?`;
    return new Promise((resolve, reject) => {
      db.get(sql, [userName], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  async function registerUser(userName, password) {
    try {
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            reject(err);
          } else {
            resolve(hashedPassword);
          }
        });
      });

      const sql = `INSERT INTO register (userName, password) VALUES (?, ?)`;
      await new Promise((resolve, reject) => {
        db.run(sql, [userName, hashedPassword], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      console.log("Sikeres regisztráció.");
    } catch (err) {
      throw err;
    }
  }
});

app.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const userId = await loginUser(userName, password);
    res.status(200).send({ message: "Sikeres bejelentkezés", userId });
  } catch (err) {
    res.status(401).send("Hibás bejelentkezési adatok.");
  }
});

async function loginUser(userName, password) {
  const sql = `SELECT * FROM register WHERE userName = ?`;

  const row = await new Promise((resolve, reject) => {
    db.get(sql, [userName], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (!row) {
    throw new Error("Felhasználó nem található.");
  }

  const match = await bcrypt.compare(password, row.password);

  if (!match) {
    throw new Error("Hibás jelszó.");
  }

  return row.id;
}

function verifyId(req, res, next) {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).send("Userid szükséges!");
  }
  const sql = "SELECT * FROM users where userId = ?";

  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error(`Error verifying user id:`, err.message);
      return res.status(500).json({ error: "Failed to verify user id." });
    }
    if (!row) {
      console.error(`User not found with id: ${userId}`);
      return res.status(404).json({ error: "User not found." });
    }
    req.user = row;
    next();
  });
}

//Felhasználók törlése

// function deleteUsers () {
//   app.delete('/register', (req, res) => {
//     const sql = 'DELETE FROM register';
//     db.run(sql, [], (err) => {
//       if (err) {
//         console.error(`Error deleting users:`, err.message);
//         return res.status(500).json({ error: "Failed to delete users." });
//       }
//       res.status(200).json({ message: "Users deleted successfully." });
//       console.log("Users deleted successfully.");
//     });
//   })
// }

// Kiadások kezelése

// app.get("/expenses", verifyToken, (req, res) => {
//   const userId = req.user.id;
//   const sql = `SELECT * FROM expenses WHERE user_id = ?`;

//   db.all(sql, [userId], (err, rows) => {
//     if (err) {
//       console.error(
//         `[${new Date().toISOString()}] Error retrieving expenses:`,
//         err.message
//       );
//       return res.status(500).json({ error: "Failed to retrieve expenses." });
//     }

//     if (rows.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No expenses found for the user." });
//     }

//     res.json({ expenses: rows });
//   });
// });

// app.post("/expenses", verifyToken, (req, res) => {
//   const userId = req.user.id;
//   const { amount, date } = req.body;

//   console.log("Request body: ", req.body);
//   console.log("User ID: ", req.user.id);

//   if (!amount || !date || !userId) {
//     return res.status(400).json({ error: "Missing required fields." });
//   }

//   // Ellenőrizzük, hogy van-e már azonos dátummal rekord
//   const checkSql = `SELECT amount FROM expenses WHERE date = ? AND user_id = ?`;
//   db.get(checkSql, [date, userId], (err, row) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     if (row) {
//       // Ha van egyezés, frissítjük az amount értéket
//       const updatedAmount = row.amount + amount;
//       const updateSql = `UPDATE expenses SET amount = ? WHERE date = ? AND user_id = ?`;

//       db.run(updateSql, [updatedAmount, date, userId], function (err) {
//         if (err) {
//           return res.status(500).json({ error: err.message });
//         }
//         return res.json({ message: "Expense updated successfully." });
//       });
//     } else {
//       // Ha nincs egyezés, beszúrunk egy új rekordot
//       const insertSql = `INSERT INTO expenses (amount, date, user_id) VALUES (?, ?, ?)`;

//       db.run(insertSql, [amount, date, userId], function (err) {
//         if (err) {
//           return res.status(500).json({ error: err.message });
//         }
//         return res.json({
//           message: "Expense added successfully.",
//           id: this.lastID,
//         });
//       });
//     }
//   });
// });

// app.delete("/expenses", verifyToken, function (req, res) {
//   const userId = req.user.id;
//   const sql = `DELETE FROM expenses WHERE user_id = ?`;

//   db.run(sql, [userId], function (err) {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json({ message: "All expenses deleted successfully." });
//   });
// });

// Elemek mozgatása a shoppingList komponensből a többi komponensbe.

app.post("/move_item", verifyId, (req, res) => {
  const { itemName, sourceTable, targetTable } = req.body;
  console.log("Received request body:", req.body);

  const validTables = [
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];

  if (!validTables.includes(sourceTable)) {
    console.log("Invalid source table name received:", sourceTable);
    return res
      .status(400)
      .json({ error: `Invalid source table name: ${sourceTable}` });
  }
  if (!validTables.includes(targetTable)) {
    console.log("Invalid target table name received:", targetTable);
    return res
      .status(400)
      .json({ error: `Invalid target table name: ${targetTable}` });
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

// Elemek mozgatása a shoppingList komponensbe.

app.post("/moveto_sl", verifyId, (req, res) => {
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
        .json({ error: `Item not found in the ${sourceTable}` });
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

// fridge items

app.get("/:table", verifyId, (req, res) => {
  const { table } = req.params;
  const { userId } = req.query;
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

app.post("/:table", verifyId, (req, res) => {
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

app.delete("/:table/:id", verifyId, (req, res) => {
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

app.put("/:table/:id", verifyId, (req, res) => {
  const { table, id } = req.params;
  const validTables = [
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];
  const { quantity } = req.body;

  if (!validTables.includes(table)) {
    return res.status(400).json({ error: "Invalid table name." });
  }

  const sql = `UPDATE ${table} SET quantity = ? WHERE id = ?`;
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
