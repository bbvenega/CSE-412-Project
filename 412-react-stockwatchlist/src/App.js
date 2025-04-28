import { useState } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // PLACEHOLDER FOR THE TICKERS REPLACE WITH QUERY
  const [availableStocks] = useState([
    { S_TICKER: 'STOCK1' },
    { S_TICKER: 'STOCK2' },
    { S_TICKER: 'STOCK3' },
  ]);
  // PLACEHOLDER ADD IN OUR QUERY TO PULL THE HISTORICAL DATA
  const [historicalData] = useState([
    { HS_ID: 1, TICKER: 'STOCK1', HS_DATE: '2025-04-26', HS_OPEN_PRICE: 99, HS_HIGH: 99, HS_LOW: 99, HS_CLOSING_PRICE: 99, HS_VOLUME: 99 },
    { HS_ID: 2, TICKER: 'STOCK2', HS_DATE: '2025-04-26', HS_OPEN_PRICE: 99, HS_HIGH: 99, HS_LOW: 99, HS_CLOSING_PRICE: 99, HS_VOLUME: 99  },
    { HS_ID: 3, TICKER: 'STOCK3', HS_DATE: '2025-04-26', HS_OPEN_PRICE: 99, HS_HIGH: 99, HS_LOW: 99, HS_CLOSING_PRICE: 99, HS_VOLUME: 99  },
    { HS_ID: 4, TICKER: 'STOCK1', HS_DATE: '2025-04-25', HS_OPEN_PRICE: 99, HS_HIGH: 99, HS_LOW: 99, HS_CLOSING_PRICE: 99, HS_VOLUME: 99  },
    { HS_ID: 5, TICKER: 'STOCK2', HS_DATE: '2025-04-25', HS_OPEN_PRICE: 99, HS_HIGH: 99, HS_LOW: 99, HS_CLOSING_PRICE: 99, HS_VOLUME: 99  },
    { HS_ID: 6, TICKER: 'STOCK3', HS_DATE: '2025-04-25', HS_OPEN_PRICE: 99, HS_HIGH: 99, HS_LOW: 99, HS_CLOSING_PRICE: 99, HS_VOLUME: 99  },
  ]);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // REPLACE WITH QUERY TO GET USERNAME AND PASSWORD RIGHT NOW ITS "username" "password"
    if (username && password) setIsLoggedIn(true);
  };

  const handleAddToWatchlist = (e) => {
    const ticker = e.target.value;
    if (ticker && !watchlist.some((stock) => stock.S_TICKER === ticker)) {
      const stock = availableStocks.find((s) => s.S_TICKER === ticker);
      setWatchlist([...watchlist, stock]);
      // ADD IN QUERY TO ADD STOCK INTO USER WATCHLIST
      setSelectedStock(ticker);
    }
  };

  const handleRemoveFromWatchlist = (ticker) => {
    setWatchlist(watchlist.filter((stock) => stock.S_TICKER !== ticker));
    if (selectedStock === ticker) setSelectedStock('');
    // ADD IN QUERY TO DELETE FROM USER WATCHLIST
  };

  const handleStockSelect = (ticker) => {
    setSelectedStock(ticker);
    setSelectedDate('');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getAvailableDates = (ticker) => {
    //REPLACE WITH QUERY TO GET ALL DATES FROM THE TICKER FOR DROPDOWN
    return [...new Set(historicalData
      .filter((data) => data.TICKER === ticker)
      .map((data) => data.HS_DATE))]
      .sort((a, b) => new Date(b) - new Date(a));
  };

  const getLatestData = (ticker) => {
    const dates = getAvailableDates(ticker);
    const latestDate = dates[0];
    // REPLACE WITH A QUERY TO GET THE MOST RECENT STOCK DATA
    return historicalData.find((data) => data.TICKER === ticker && data.HS_DATE === latestDate);
  };

  const getHistoricalData = (ticker, date) => {
    //REPLACE WITH A QUERY TO GET ALL OF THE INFO FOR THE DATE THAT WAS CHOSEN
    return historicalData.find((data) => data.TICKER === ticker && data.HS_DATE === date);
  };
  //LOGIN HTML
  if (!isLoggedIn) {
    return (
      <div className="app">
        <h1>Stock Watchlist</h1>
        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  //MAIN PAGE HTML
  return (
    <div className="app">
      <h1>Stock Watchlist</h1>
      <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
      <div className="container">
        <div className="section">
          <h2>Add to Watchlist</h2>
          <select onChange={handleAddToWatchlist} value="">
            <option value="" disabled>Select a stock</option>
            {availableStocks.map((stock) => (
              <option key={stock.S_TICKER} value={stock.S_TICKER}>
                ({stock.S_TICKER})
              </option>
            ))}
          </select>
          <ul>
            {watchlist.map((stock) => (
              <li key={stock.S_TICKER}>
                <button
                  className={`stock-btn ${selectedStock === stock.S_TICKER ? 'selected' : ''}`}
                  onClick={() => handleStockSelect(stock.S_TICKER)}
                >
                  ({stock.S_TICKER})
                </button>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFromWatchlist(stock.S_TICKER)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="section">
          <h2>Stock Data {selectedStock && `(${selectedStock})`}</h2>
          {selectedStock ? (
            <>
              <h3>Most Recent Close Price</h3>
              {(() => {
                const latestData = getLatestData(selectedStock);
                return latestData ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{latestData.HS_DATE}</td>
                        <td>${latestData.HS_CLOSING_PRICE}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p>No data</p>
                );
              })()}
              <h3>Historical Data</h3>
              <select onChange={handleDateChange} value={selectedDate}>
                <option value="" disabled>Select a date</option>
                {getAvailableDates(selectedStock).map((date) => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              {selectedDate && (() => {
                const data = getHistoricalData(selectedStock, selectedDate);
                return data ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>Date</th>
                        <th>Open</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Close</th>
                        <th>Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{data.TICKER}</td>
                        <td>{data.HS_DATE}</td>
                        <td>${data.HS_OPEN_PRICE}</td>
                        <td>${data.HS_HIGH}</td>
                        <td>${data.HS_LOW}</td>
                        <td>${data.HS_CLOSING_PRICE}</td>
                        <td>{data.HS_VOLUME}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p>No data</p>
                );
              })()}
            </>
          ) : (
            <p>Select a stock from your watchlist</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;