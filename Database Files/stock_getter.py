import requests
import psycopg2
from datetime import datetime, timedelta
import time
import pandas as pd
import os

API_KEY = ""

djia_tickers = [
    "MMM", "AXP", "AMGN", "AMZN", "AAPL", "BA", "CAT", "CVX", "CSCO", "KO",
    "DIS", "GS", "HD", "HON", "IBM", "JNJ", "JPM", "MCD", "MRK", "MSFT",
    "NKE", "NVDA", "PG", "CRM", "TRV", "UNH", "VZ", "V", "WMT", "DOW"
]

conn = psycopg2.connect(
    dbname="djia_stocks",
    user="qick",
    host="localhost",
    port="3000"
)
cursor = conn.cursor()

def fetch_stock_data(ticker):
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={ticker}&apikey={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if "Time Series (Daily)" in data:
            return pd.DataFrame(data["Time Series (Daily)"]).T
        else:
            print("No data")
            return None
    else:
        print("Failed")
        return None

print(f"Processing {len(djia_tickers)}")
for i, ticker in enumerate(djia_tickers):
    data = fetch_stock_data(ticker)
    
    if data is not None:
        print(f"Inserting data {ticker}")
        for date, row in data.iterrows():
            try:
                cursor.execute(
                    """
                    INSERT INTO stock_prices (ticker, date, open, high, low, close, volume)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                    """,
                    (
                        ticker,
                        date,
                        float(row["1. open"]),
                        float(row["2. high"]),
                        float(row["3. low"]),
                        float(row["4. close"]),
                        int(row["5. volume"])
                    )
                )
            except Exception as e:
                print("Error")
        conn.commit()
    else:
        print(f"Skipping")
    
    if i < len(djia_tickers) - 1:
        time.sleep(12) 

cursor.close()
conn.close()
print("completed")