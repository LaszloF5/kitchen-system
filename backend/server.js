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
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    week INTEGER NOT NULL,
    user_id INTEGER NOT NULL
    )`);
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

app.post("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid old password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePassword(userId, hashedPassword);

    res.status(200).json({ message: "Password changed successfully." });

  } catch (err) {
    console.error("Error during password change:", err);
    res.status(500).send("An error occurred during password change.");
  }

  async function getUserById(userId) {
    const sql = "SELECT * FROM register WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  }

  async function updatePassword(userId, newPassword) {
    const sql = 'UPDATE register SET password = ? WHERE id = ?';

    return new Promise((resolve, reject) => {
      db.run(sql, [newPassword, userId], (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
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
  const userId =
    req.query.user_id ||
    req.params.userId ||
    req.body.userId ||
    req.query.userId;
  if (!userId) {
    return res
      .status(400)
      .send("You need to be logged in to perform this action!");
  }
  const sql = "SELECT * FROM register where id = ?";

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
    console.log('VerifyId: ', req.user);
    next();
  });
}

// Delete user

app.delete("/delete-account", verifyId, async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const tables = [
    "expenses",
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];

  try {
    for (let table of tables) {
      await new Promise((resolve, reject) => {
        const sql = `DELETE FROM ${table} WHERE user_id = ?`;

        db.run(sql, [userId], function (err) {
          if (err) {
            console.error(`Error deleting from table ${table}`, err.message);
            reject(err);
          }
          console.log(`Deleted from table ${table}: `, this.changes, "rows");
          resolve();
        });
      });
    }
  } catch {
    console.error(`Error deleting user's data:`, err.message);
    return res.status(500).json({ error: "Failed to delete user's data." });
  }

  const sql = "DELETE FROM register WHERE id = ?";

  db.run(sql, [userId], function (err) {
    if (err) {
      console.error(`Error deleting user:`, err.message);
      return res.status(500).json({ error: "Failed to delete user." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "User not found to delete." });
    }

    res.status(200).json({ message: "User deleted successfully." });
    console.log("User deleted successfully.");
  });
});

// Kiadások kezelése

app.get("/expenses", verifyId, (req, res) => {
  const userId = req.user.id;
  const sql = `SELECT * FROM expenses WHERE user_id = ?`;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error(`Error retrieving expenses:`, err.message);
      return res.status(500).json({ error: "Failed to retrieve expenses." });
    }
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No expenses found for the user." });
    }
    res.json({ expenses: rows });
  });
});

app.post("/expenses", verifyId, (req, res) => {
  const userId = req.user.id;
  const { amount, year, month, week } = req.body;

  console.log("Request body: ", amount, year, month, week);
  console.log("User id: ", userId);

  if (!amount || !year || !month || !week) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!userId) {
    return res.status(400).json({ error: "User ID is missing." });
  }
  // Ha már van bevitt amount az aktuális héten.
  const sql = `SELECT amount FROM expenses WHERE year = ? AND month = ? AND week = ? AND user_id = ?`;

  db.get(sql, [year, month, week, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result) {
      const updatedAmount = Number(result.amount) + Number(amount);
      const updateSql = `UPDATE expenses SET amount = ? WHERE year = ? AND month = ? AND week = ? AND user_id = ?`;

      db.run(updateSql, [updatedAmount, year, month, week, userId], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({
          message: "Expense added successfully.",
          data: { amount, year, month, week, user_id: userId },
        });
      });
    } else {
      // Ha nincs egyezés új sort hozunk létre
      const insertSql = `INSERT INTO expenses (amount, year, month, week, user_id) VALUES(?, ?, ?, ?, ?)`;

      db.run(insertSql, [amount, year, month, week, userId], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({
          message: "Expense added successfully.",
          data: { amount, year, month, week, user_id: userId },
        });
      });
    }
  });
});

app.delete("/expenses", verifyId, function (req, res) {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ error: "User ID is missing." });
  }
  // Ellenőrizzük, hogy a felhasználóhoz van-e elérhető rekord.
  const sql = `SELECT * FROM expenses WHERE user_id = ?`;
  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error(`Error retrieving expenses:`, err.message);
      return res.status(500).json({ error: "Failed to retrieve expenses." });
    }
    if (!row) {
      return res
        .status(404)
        .json({ message: "No expenses found for this user." });
    }
  });
  // Ha van, akkor töröljük.
  const deleteSql = `DELETE FROM expenses WHERE user_id = ?`;

  db.run(deleteSql, [userId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "All expenses deleted successfully." });
  });
});

// Elemek mozgatása a shoppingList komponensből a többi komponensbe.

app.post("/move_item", verifyId, (req, res) => {
  const { itemName, sourceTable, targetTable, dateNow, userId } = req.body;
  // const userId = req.user.id;
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
    `SELECT * FROM ${sourceTable} WHERE name = ? AND user_id = ?`,
    [itemName, userId],
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
        `SELECT * FROM ${targetTable} WHERE name = ? AND user_id = ?`,
        [itemName, userId],
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
                `UPDATE ${targetTable} SET quantity = ?, date_added = ? WHERE name = ? AND user_id = ?`,
                [updatedQuantity, dateNow, itemName, userId],
                function (err) {
                  if (err) return res.status(500).json({ error: err.message });

                  // Sikeres UPDATE után törli a forrástáblából
                  db.run(
                    `DELETE FROM ${sourceTable} WHERE name = ? AND user_id = ?`,
                    [itemName, userId],
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
              `INSERT INTO ${targetTable} (name, quantity, date_added, user_id) VALUES (?, ?, ?, ?)`,
              [
                sourceRow.name,
                sourceRow.quantity,
                sourceRow.date_added,
                userId,
              ],
              function (err) {
                if (err) return res.status(500).json({ error: err.message });

                // Sikeres INSERT után törli a forrástáblából
                db.run(
                  `DELETE FROM ${sourceTable} WHERE name = ? AND user_id = ?`,
                  [itemName, userId],
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
  const userId = req.user.id;
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

  const sql = `SELECT * FROM ${sourceTable} WHERE name = ? AND user_id = ?`;

  db.get(sql, [itemName, userId], function (err, transferItem) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!transferItem) {
      return res
        .status(400)
        .json({ error: `Item not found in the ${sourceTable}` });
    }
    const sql2 = `SELECT * FROM ${targetTable} WHERE name = ? AND user_id = ?`;
    db.get(sql2, [itemName, userId], function (err, targetItem) {
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

        const sql3 = `UPDATE ${targetTable} SET quantity = ?, date_added = ? WHERE name = ? AND user_id = ?`;
        db.run(sql3, [validQty, date, itemName, userId], function (err) {
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
        const sql4 = `INSERT INTO ${targetTable} (name, quantity, date_added, user_id) VALUES (?, ?, ?, ?)`;
        db.run(
          sql4,
          [transferItem.name, validQty, date, userId],
          function (err) {
            if (err) {
              return res.status(400).json({ error: err.message });
            }
            res.json({ message: "Item moved to shopping list successfully." });
          }
        );
      }
    });
  });
});

// fridge items

app.get("/:table", verifyId, (req, res) => {
  const { table } = req.params;
  const userId = req.user.id;
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

  const sql = `SELECT * FROM ${table} WHERE user_id = ?`;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ items: rows });
  });
});

app.post("/:table", verifyId, (req, res) => {
  const { table } = req.params;
  const { name, quantity, date_added } = req.body;
  const userId = req.user.id;
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
  console.log('A date_added formátuma: ', date_added);
  const sql = `INSERT INTO ${table} (name, quantity, date_added, user_id) VALUES(?, ?, ?, ?)`;
  db.run(sql, [name, quantity, date_added, userId], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, date_added, user_id: userId });
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
  const userId = req.user.id;
  const validTables = [
    "fridge_items",
    "freezer_items",
    "chamber_items",
    "others_items",
    "shoppingList_items",
  ];
  const { quantity, dateNow } = req.body;
  console.log("VerifyId ok.");
  if (!validTables.includes(table)) {
    return res.status(400).json({ error: "Invalid table name." });
  }

  if (!quantity || !dateNow) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const sql = `UPDATE ${table} SET quantity = ?, date_added = ? WHERE id = ? AND user_id = ?`;
  const regex = /\d+(\.\d+)?/;
  const qty = Number(...quantity.match(regex));
  const unit = quantity.replace(Number.parseFloat(quantity), "");
  const validQty = `${qty} ${unit}`;

  db.run(sql, [validQty, dateNow, id, userId], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Item quantity and date updated", id, quantity, dateNow });
  });
});

function getDatas() {
  const sql = `SELECT * FROM shoppingList_items WHERE user_id = ?`;
  db.all(sql, [2], (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
  });
};

getDatas();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// process.on('SIGINT', () => {
//   db.close((err) => {
//     if (err) {
//       console.error('Error closing db: ', err.message)
//     } else {
//       console.log('DB connection closed')
//       process.exit(0)
//     }
//   })
// })