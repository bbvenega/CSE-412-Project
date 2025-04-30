const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all stock tickers
router.get('/stocks', async (req, res) => {
    console.log('GET /api/stocks called'); //testing 
    try {
      const result = await pool.query('SELECT S_TICKER FROM STOCK');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      res.status(500).send('Server error');
    }
  });

// GET historical data for a given stock
router.get('/historical/:ticker', async (req, res) => {
    const { ticker } = req.params;
    console.log(`Fetching historical for: ${ticker}`);
    try {
      const result = await pool.query(
        `SELECT * FROM HISTORICAL_STOCK WHERE TICKER = $1 ORDER BY HS_DATE DESC`,
        [ticker]
      );
      console.log('Returned rows:', result.rows.length);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      res.status(500).send('Server error');
    }
  });
  

// GET latest closing price for a stock
router.get('/latest/:ticker', async (req, res) => {
  const { ticker } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM HISTORICAL_STOCK WHERE TICKER = $1 ORDER BY HS_DATE DESC LIMIT 1`,
      [ticker]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching latest data:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
