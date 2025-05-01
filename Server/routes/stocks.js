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

// Calls api in sorted order
router.get("/stocks", async (req, res) => {
  const sort = req.query.sort || "Ticker";
  console.log("Received sort value from client:", sort);

  let query = "SELECT * FROM stock ";

  if (sort === "Ticker") {
    query += "ORDER BY stock.s_ticker";
  } else if (sort === "Date") {
    query += `
      ORDER BY (
        SELECT MAX(hs_date)
        FROM historical_stock
        WHERE historical_stock.ticker = stock.s_ticker
      ) DESC NULLS LAST
    `;
  } else if (sort === "Close") {
    query += `
      ORDER BY (
        SELECT hs_closing_price
        FROM historical_stock
        WHERE historical_stock.ticker = stock.s_ticker
        ORDER BY hs_date DESC
        LIMIT 1
      ) DESC NULLS LAST
    `;
  } else if (sort === "High") {
    query += `
       ORDER BY (
        SELECT hs_high
        FROM historical_stock
        WHERE historical_stock.ticker = stock.s_ticker
        ORDER BY hs_date DESC
        LIMIT 1
      ) DESC NULLS LAST
    `;
  } else if (sort === "Volume") {
    query += `
    ORDER BY (
     SELECT hs_volume
     FROM historical_stock
     WHERE historical_stock.ticker = stock.s_ticker
     ORDER BY hs_date DESC
     LIMIT 1
   ) DESC NULLS LAST
 `;
  } else if (sort === "Open") {
    query += `
    ORDER BY (
     SELECT hs_open_price
     FROM historical_stock
     WHERE historical_stock.ticker = stock.s_ticker
     ORDER BY hs_date DESC
     LIMIT 1
   ) DESC NULLS LAST
 `;
  } else if (sort === "Low") {
    query += `
    ORDER BY (
     SELECT hs_low
     FROM historical_stock
     WHERE historical_stock.ticker = stock.s_ticker
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

module.exports = router;
