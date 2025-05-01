import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [availableStocks, setAvailableStocks] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [sortOption, setSortOption] = useState("Ticker");
  const [maxMinOption, setmaxMinOption] = useState("Open");
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(Infinity);

  // Fetch all available stocks
  useEffect(() => {
    fetch("http://localhost:5050/api/stocks")
      .then((res) => res.json())
      .then((data) => setAvailableStocks(data))
      .catch((err) => console.error("Error fetching stocks:", err));
  }, []);

  // Fetch historical data for all stocks
  useEffect(() => {
    async function fetchAllHistoricalData() {
      try {
        const allData = await Promise.all(
          availableStocks.map(
            (stock) =>
              fetch(`http://localhost:5050/api/historical/${stock.s_ticker}`)
                .then((res) => res.json())
                .catch(() => []) // Handle individual fetch failures
          )
        );

        setHistoricalData(allData.flat());
      } catch (err) {
        console.error("Error fetching all historical data:", err);
      }
    }

    if (availableStocks.length > 0) {
      fetchAllHistoricalData();
    }
  }, [availableStocks]);

  // COMMENTED OUT BECAUSE NO LONGER NEEDED
  // Fetch historical data for selected stock
  // useEffect(() => {
  //   if (selectedStock) {
  //     fetch(`http://localhost:5050/api/historical/${selectedStock}`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         console.log("Keys of first record:", Object.keys(data[0])); //first record for the stock
  //         setHistoricalData(data);
  //       })
  //       .catch((err) => console.error("Error fetching historical data:", err));
  //   }
  // }, [selectedStock]);

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
    if (selectedStock === ticker) setSelectedStock("");
  };

  const handleStockSelect = (ticker) => {
    setSelectedStock(ticker);
    setSelectedDate("");
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getAvailableDates = (ticker) => {
    return [
      ...new Set(
        historicalData
          .filter((data) => data.ticker === ticker)
          .map((data) => data.hs_date)
      ),
    ].sort((a, b) => new Date(b) - new Date(a));
  };

  const getLatestData = (ticker) => {
    const dates = getAvailableDates(ticker);
    const latestDate = dates[0];
    console.log(
      "Ticker:",
      ticker,
      "Dates:",
      dates,
      "Latest Dates:",
      latestDate
    );

    return historicalData.find(
      (data) => data.ticker === ticker && data.hs_date === latestDate
    );
  };

  const getHistoricalData = (ticker, date) => {
    return historicalData.find(
      (data) => data.ticker === ticker && data.hs_date === date
    );
  };

  // Reacts to whenver the sort select menu changes
  const handleSortChange = async (option, maxMinOption) => {
    const maxToSend = isFinite(maxVal) ? maxVal : 100000000000;
    const minToSend = isFinite(minVal) ? minVal : 0;
    setSortOption(option);
    try {
      const res = await fetch(
        `http://localhost:5050/api/stocks?sort=${option}&filter=${maxMinOption}&max=${maxToSend}&min=${minToSend}`
      );
      const data = await res.json();
      setAvailableStocks(data);
    } catch (err) {
      console.log("error fetching sorted stocks: ", err);
    }
  };

  // Handles visual change for select filter
  const handleFilterChange = (filterOption) => {
    setmaxMinOption(filterOption);
  };

  // Handles when the filter button is pressed
  const handleFilterClick = async (
    option,
    maxMinOption,
    min = minVal,
    max = maxVal
  ) => {
    const maxToSend = isFinite(maxVal) ? max : 100000000000;
    const minToSend = isFinite(minVal) ? min : 0;
    try {
      console.log(
        `http://localhost:5050/api/stocks?sort=${option}&filter=${maxMinOption}&max=${maxToSend}&min=${minToSend}`
      );
      const res = await fetch(
        `http://localhost:5050/api/stocks?sort=${option}&filter=${maxMinOption}&max=${maxToSend}&min=${minToSend}`
      );
      const data = await res.json();
      setAvailableStocks(data);
    } catch (err) {
      console.log("error fetching sorted stocks: ", err);
    }
  };

  // Formats date string into YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-based month
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
      <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>
        Logout
      </button>
      <div className="container">
        <div className="section">

          {/* Table: Recent Stock Data  */}
          <h2>Recent Stock Data</h2>

          {/* Select: User selects how recent stock data should be sorted */}
          <label>
            Sort by:{" "}
            <select
              value={sortOption}
              onChange={(e) => handleSortChange(e.target.value, maxMinOption)}
            >
              <option value="Ticker">Ticker</option>
              <option value="Date">Date</option>
              <option value="Open">Opening Price</option>
              <option value="Volume">Volume</option>
              <option value="Close">Closing Price</option>
              <option value="High">High</option>
              <option value="Low">Low</option>
            </select>
          </label>

          {/* Select: User selects filter value and min and max range */}
          <label>
            Filter Values:{" "}
            <select
              value={maxMinOption}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="Open">Opening Price</option>
              <option value="Volume">Volume</option>
              <option value="Close">Closing Price</option>
              <option value="High">High</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <p>Selected filter: {maxMinOption}</p>

          {/* Min input  */}
          <input
            type="number"
            step="0.01"
            value={minVal}
            onChange={(e) => setMinVal(parseFloat(e.target.value))}
            placeholder="Enter min value"
          />

          {/* Max input  */}
          <input
            type="number"
            step="0.01"
            value={maxVal}
            onChange={(e) => setMaxVal(parseFloat(e.target.value))}
            placeholder="Enter max value"
          />

          {/* Filter buttons  */}
          <button
            onClick={() => {
              handleFilterClick(sortOption, maxMinOption);
            }}
          >
            Apply Filter
          </button>
          <button
            onClick={() => {
              setMinVal(0);
              setMaxVal(Infinity);
              handleFilterClick(sortOption, "", 0, Infinity);
            }}
          >
            Reset Filter
          </button>

          <table className="table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Date</th>
                <th>Open</th>
                <th>Close</th>
                <th>Volume</th>
                <th>High</th>
                <th>Low</th>
              </tr>
            </thead>
            <tbody>
              {availableStocks.map((stock, index) => {
                const newestData = getLatestData(stock.s_ticker); // Fix: pass ticker string

                return newestData ? (
                  <tr key={index}>
                    <td>{stock.s_ticker}</td>
                    <td>{formatDate(newestData.hs_date)}</td>
                    <td>${newestData.hs_open_price}</td>
                    <td>${newestData.hs_closing_price}</td>
                    <td>{newestData.hs_volume}</td>
                    <td>${newestData.hs_high}</td>
                    <td>${newestData.hs_low}</td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td>{stock.s_ticker}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="section">
          <h2>Add to Watchlist</h2>
          <select onChange={handleAddToWatchlist} value="">
            <option value="" disabled>
              Select a stock
            </option>
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
                  className={`stock-btn ${
                    selectedStock === stock.s_ticker ? "selected" : ""
                  }`}
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
                <option value="" disabled>
                  Select a date
                </option>
                {getAvailableDates(selectedStock).map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
              {selectedDate &&
                (() => {
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
