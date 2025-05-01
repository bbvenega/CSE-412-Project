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

module.exports = router;
