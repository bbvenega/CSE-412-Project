import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [availableStocks, setAvailableStocks] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch all available stocks
  useEffect(() => {
    fetch('http://localhost:5050/api/stocks')
      .then(res => res.json())
      .then(data => setAvailableStocks(data))
      .catch(err => console.error('Error fetching stocks:', err));
  }, []);

  // Fetch historical data for selected stock
  useEffect(() => {
    if (selectedStock) {
      fetch(`http://localhost:5050/api/historical/${selectedStock}`)
        .then(res => res.json())
        .then(data => {
          console.log('Keys of first record:', Object.keys(data[0])); //first record for the stock
          setHistoricalData(data)})
        .catch(err => console.error('Error fetching historical data:', err));
    }
  }, [selectedStock]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) setIsLoggedIn(true); // Add actual login logic here
  };

  const handleAddToWatchlist = (e) => {
    const ticker = e.target.value;
    if (ticker && !watchlist.some((stock) => stock.s_ticker === ticker)) {
      const stock = availableStocks.find((s) => s.s_ticker === ticker);
      setWatchlist([...watchlist, stock]);
      setSelectedStock(ticker);
    }
  };

  const handleRemoveFromWatchlist = (ticker) => {
    setWatchlist(watchlist.filter((stock) => stock.s_ticker !== ticker));
    if (selectedStock === ticker) setSelectedStock('');
  };

  const handleStockSelect = (ticker) => {
    setSelectedStock(ticker);
    setSelectedDate('');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getAvailableDates = (ticker) => {
    return [...new Set(historicalData
      .filter((data) => data.ticker === ticker)
      .map((data) => data.hs_date))]
      .sort((a, b) => new Date(b) - new Date(a));
  };
  
  const getLatestData = (ticker) => {
    const dates = getAvailableDates(ticker);
    const latestDate = dates[0];
    return historicalData.find((data) => data.ticker === ticker && data.hs_date === latestDate);
  };
  
  const getHistoricalData = (ticker, date) => {
    return historicalData.find((data) => data.ticker === ticker && data.hs_date === date);
  };  

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
              <option key={stock.s_ticker} value={stock.s_ticker}>
                {stock.s_ticker}
              </option>
            ))}
          </select>
          <ul>
            {watchlist.map((stock) => (
              <li key={stock.s_ticker}>
                <button
                  className={`stock-btn ${selectedStock === stock.s_ticker ? 'selected' : ''}`}
                  onClick={() => handleStockSelect(stock.s_ticker)}
                >
                  {stock.s_ticker}
                </button>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFromWatchlist(stock.s_ticker)}
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
                        <td>{latestData.hs_date}</td>
                        <td>${latestData.hs_closing_price}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p>No data available</p>
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
                        <td>{data.ticker}</td>
                        <td>{data.hs_date}</td>
                        <td>${data.hs_open_price}</td>
                        <td>${data.hs_high}</td>
                        <td>${data.hs_low}</td>
                        <td>${data.hs_closing_price}</td>
                        <td>{data.hs_volume}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p>No historical data</p>
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
