const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all stock tickers
// router.get('/stocks', async (req, res) => {
//     console.log('GET /api/stocks called'); //testing
//     try {
//       const result = await pool.query('SELECT S_TICKER FROM STOCK');
//       res.json(result.rows);
//     } catch (err) {
//       console.error('Error fetching stocks:', err);
//       res.status(500).send('Server error');
//     }
//   });

// Calls api in sorted order, and filters if a filter is passed in
router.get("/stocks", async (req, res) => {

  // Read in passsed in values determined by sort / filter select
  // As well as min / max
  const sort = req.query.sort || "Ticker";
  const filter = req.query.filter || "";
  const min = parseFloat(req.query.min);
  const max = parseFloat(req.query.max);

//Debugging Stuff
  // console.log("Received sort value from client:", sort);
  // console.log("Received filter value from client:", filter);
  // console.log("Received min value from client:", min);
  // console.log("Received max value from client:", max);

  // Default Query: Selects all stocks, uses where 1=1 to make it possible to append filters conditionally
  let query = "SELECT * FROM stock s WHERE 1=1 ";

  //  Converts simple language to db attributes
  const columnMap = {
    Close: "hs_closing_price",
    Open: "hs_open_price",
    High: "hs_high",
    Low: "hs_low",
    Volume: "hs_volume",
  };

  const column = columnMap[filter];

  // Checks to see if the user passed in a filter and valid min / max
  if (column && !isNaN(min) && !isNaN(max)) {
    query += `
      AND (
        SELECT ${column}
        FROM historical_stock h
        WHERE h.ticker = s.s_ticker
        ORDER BY hs_date DESC
        LIMIT 1
      ) BETWEEN ${min} AND ${max}
    `;
  }


  // If-else determines order of results from main query
  if (sort === "Ticker") {
    query += " ORDER BY s.s_ticker";
  } else if (sort === "Date") {
    query += `
       ORDER BY (
        SELECT MAX(hs_date)
        FROM historical_stock
        WHERE historical_stock.ticker = s.s_ticker
      ) DESC NULLS LAST
    `;
  } else if (sort === "Close") {
    query += `
       ORDER BY (
        SELECT hs_closing_price
        FROM historical_stock
        WHERE historical_stock.ticker = s.s_ticker
        ORDER BY hs_date DESC
        LIMIT 1
      ) DESC NULLS LAST
    `;
  } else if (sort === "High") {
    query += `
        ORDER BY (
        SELECT hs_high
        FROM historical_stock
        WHERE historical_stock.ticker = s.s_ticker
        ORDER BY hs_date DESC
        LIMIT 1
      ) DESC NULLS LAST
    `;
  } else if (sort === "Volume") {
    query += `
     ORDER BY (
     SELECT hs_volume
     FROM historical_stock
     WHERE historical_stock.ticker = s.s_ticker
     ORDER BY hs_date DESC
     LIMIT 1
   ) DESC NULLS LAST
 `;
  } else if (sort === "Open") {
    query += `
     ORDER BY (
     SELECT hs_open_price
     FROM historical_stock
     WHERE historical_stock.ticker = s.s_ticker
     ORDER BY hs_date DESC
     LIMIT 1
   ) DESC NULLS LAST
 `;
  } else if (sort === "Low") {
    query += `
     ORDER BY (
     SELECT hs_low
     FROM historical_stock
     WHERE historical_stock.ticker = s.s_ticker
     ORDER BY hs_date DESC
     LIMIT 1
   ) ASC NULLS LAST
 `;
  }

  query += ";";
  try {
    console.log("query: ", query);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sorted stocks", err);
  }
});

// GET historical data for a given stock
router.get("/historical/:ticker", async (req, res) => {
  const { ticker } = req.params;
  // console.log(`Fetching historical for: ${ticker}`);
  try {
    const result = await pool.query(
      `SELECT * FROM HISTORICAL_STOCK WHERE TICKER = $1 ORDER BY HS_DATE DESC`,
      [ticker]
    );
    // console.log("Returned rows:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching historical data:", err);
    res.status(500).send("Server error");
  }
});

// GET latest closing price for a stock
router.get("/latest/:ticker", async (req, res) => {
  const { ticker } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM HISTORICAL_STOCK WHERE TICKER = $1 ORDER BY HS_DATE DESC LIMIT 1`,
      [ticker]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching latest data:", err);
    res.status(500).send("Server error");
  }
});

//Gets the user with the specified credentials for login
router.get("/login/:username/:password", async (req, res) => {
  const { username, password } = req.params
  try{
    console.log(username, password)
    const user = await pool.query('SELECT * FROM "Users" WHERE u_username = $1', [username])
    console.log(password)
    console.log(String(user.rows[0].u_password))
    console.log(user.rows[0].u_password.trim() == password)
    if (user.rows.length == 0 || user.rows[0].u_password.trim() !== password) {
      return res.status(401).send("Invalid")
    }
    console.log(user.rows[0].u_password)
    console.log("User found")
    res.status(200).json(user.rows[0])
  }
  catch(error) {
    console.error("Unsuccessful registration attempt:", error)
    res.status(401).send("Invalid Credentials")
  }
})

//Creates a new user
router.get("/register/:username/:password", async (req, res) => {
  const { username, password } = req.params
  try {
    const user = await pool.query('INSERT INTO "Users"(u_username, u_email, u_password) VALUES ($1, $2, $3) RETURNING *', [username, username, password])
    console.log(user)
    res.status(201).json(user.rows[0])
    console.log(res)
}
  catch(error) {
    console.error("Unsuccessful registration attempt:", error)
    res.status(401).send("Failed Registration")
  }
})

//Checks if specified user is an admin
router.get("/isAdmin/:userid", async (req, res) => {
  const { userid } = req.params
  console.log(userid)
  try {
    const user = await pool.query('SELECT * FROM "Admins" WHERE a_admin_id = $1', [userid])
    console.log(user.rows.length)
    if (user.rows.length === 0 ) {
      return res.status(401).send("Invalid")
    }
    console.log(user)
    res.status(200).json(user.rows[0])
}
  catch(error) {
    console.error("Unsuccessful admin attempt:", error)
    res.status(401).send("Not admin")
  }
})

module.exports = router;
