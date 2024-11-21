const express = require("express");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const PORT = 5500;

require('dotenv').config();

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
    `CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL,
    date TEXT NOT NULL)`
  )
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
    )
    `
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

// Felhasználó regisztrálása

app.post("/register", async (req, res) => {
  const {username, password} = req.body;

  try {
    const isUniqueUserName = "SELECT * FROM users WHERE username = ?";
    db.get(isUniqueUserName, [username], async function (err, row) {
      if (err) {
        console.error("Error checking user: ", err.message);
        return res.status(500).json({ error: "Registration failed." });
      }
      if (row) {
        console.log("Username already exists.");
        return res.status(409).json({ error: "This username already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
      db.run(sql, [username, hashedPassword], function (err) {
        console.log(username);
        if (err) {
          console.error("Error inserting user: ", err.message);
          return res.status(500).json({ error: "Registration failed." });
        }
        console.log(`User ${username} registered successfully.`);
        return res
          .status(201)
          .json({ message: "User registered successfully." });
      });
    });
  } catch (error) {
    console.log("Error registering user:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Felhasználó bejelentkezése

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('req.body: ', req.body);
  const sql = 'SELECT * FROM  users WHERE username = ?';
  db.get(sql, [username], function (err, user) {
    console.log('inside the db: ', {username});
    if (err) {
      console.error('Database error: ', err.message);
      return res.status(500).json({error: 'Login failed. Please try again later.'});
    }
    if (!user) {
      console.log('User not found.');
      return res.status(400).json({ error: 'Invalid username.' });
    }
    // Jelszó ellenőrzése
    bcrypt.compare(password, user.password).then((validPassword) => {
      if (!validPassword) {
        console.log('Invalid password.');
        return res.status(400).json({error: 'Invalid password.'});
      }
      // Token generálása
      const token = jwt.sign(
        {id: user.id},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '1h'}
      )
      res.json({token});
    }).catch(error => {
      console.error('Error comparing passwords: ', error.message);
      return res.status(500).json({error: 'Login failed. Please try again later.'});
    })
  }) 
})

// Felhasználó törlése

app.delete('/delete_user/:username', (req, res) => {
  const { username } = req.params;
  const sql = 'DELETE FROM users WHERE username = ?';
  db.run(sql, [username], function(err) {
    if (err) {
      console.error('Error deleting user: ', err.message);
      return res.status(500).json({ error: 'Failed to delete user.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    console.log(`User ${username} deleted successfully.`);
    return res.status(200).json({ message: 'User deleted successfully.' });
  });
});

// Kijelentkezés


// Felhasználók adatainak lekérdezése (Csak szerver oldal.)

db.all('SELECT * FROM users', [], function(err, row) {
  console.log('Registered users: ', row);
})

// Tokenellenörző middleware

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('A belső .env file-ban lévő secret: ', process.env.JWT_SECRET_KEY)
  if (!authHeader) {
    console.error('Authorization header missing');
    return res.sendStatus(401); // Unauthorized
  }

  const token = authHeader.split(' ')[1];
  // Token validálása (pl. jwt)
  console.log('token amit validálni kell: ', token);
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Token validation error: ', err.message);
      return res.sendStatus(403); // Forbidden
    }
    req.user = user; // Ha a token validálása sikeres, a felhasználó információt tárolunk a kérésben
    next(); // Tovább lépünk a következő middleware-re vagy végpontra
  });
};



// Elemek mozgatása a shoppingList komponensből a többi komponensbe.

app.post("/move_item", (req, res) => {
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

app.get("/:table", verifyToken, (req, res) => {
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

app.post("/:table", verifyToken, (req, res) => {
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

app.delete("/:table/:id", verifyToken, (req, res) => {
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

app.put("/:table/:id", verifyToken, (req, res) => {
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
