import requests
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv
import time
import pandas as pd
import os


load_dotenv()
current_dir = os.path.dirname(os.path.abspath(__file__))
stock_table_path = os.path.join(current_dir, "stock.csv")
hs_table_path = os.path.join(current_dir, "stock_prices.csv")
API_KEY = os.getenv("AV-API")

djia_tickers = {
    "MMM": "3M Company",
    "AXP": "American Express Company",
    "AMGN": "Amgen Inc.",
    "AMZN": "Amazon.com, Inc.",
    "AAPL": "Apple Inc.",
    "BA": "The Boeing Company",
    "CAT": "Caterpillar Inc.",
    "CVX": "Chevron Corporation",
    "CSCO": "Cisco Systems, Inc.",
    "KO": "The Coca-Cola Company",
    "DIS": "The Walt Disney Company",
    "GS": "The Goldman Sachs Group, Inc.",
    "HD": "The Home Depot, Inc.",
    "HON": "Honeywell International Inc.",
    "IBM": "International Business Machines Corporation",
    "JNJ": "Johnson & Johnson",
    "JPM": "JPMorgan Chase & Co.",
    "MCD": "McDonald's Corporation",
    "MRK": "Merck & Co., Inc.",
    "MSFT": "Microsoft Corporation",
    "NKE": "NIKE, Inc.",
    "NVDA": "NVIDIA Corporation",
    "PG": "Procter & Gamble Company",
    "CRM": "Salesforce, Inc.",
    "TRV": "The Travelers Companies, Inc.",
    "UNH": "UnitedHealth Group Incorporated",
    "VZ": "Verizon Communications Inc.",
    "V": "Visa Inc.",
    "WMT": "Walmart Inc.",
    "DOW": "Dow Inc."
}






conn = psycopg2.connect(
    dbname=os.getenv("PGDATABASE"),
    user=os.getenv("PGUSER"),
    password=os.getenv("PGPASSWORD"),
    host=os.getenv("PGHOST"),
    port=os.getenv("PGPORT")
)
cursor = conn.cursor()

def populate_stock_table():
    cnt = 1
    print(f"In populate_stock_table")
    for ticker, company_name in djia_tickers.items():
        try:
            print(f"{cnt}: Inserting {ticker} - {company_name} in stock table\n")
            cnt += 1
            cursor.execute(

                """
                INSERT INTO stock(s_ticker, s_company_name)
                VALUES (%s,%s)
                ON CONFLICT DO NOTHING
                """,
                (
                    ticker,
                    company_name[0:25]
                )
            ) 
        except Exception as e:
            print(f"Error population stocks table: {e}")
    
    conn.commit()
    print(f"Finished with populated stock table\n")
    return


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
populate_stock_table()
for i, ticker in enumerate(djia_tickers):
    data = fetch_stock_data(ticker)
    
    if data is not None:
        print(f"Inserting data {ticker}")
        for date, row in data.iterrows():
            try:
                cursor.execute(
                    """
                    INSERT INTO historical_stock (ticker, hs_date, hs_open_price, hs_high, hs_low, hs_closing_price, hs_volume)
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
                print(f"Error: {e}")
        conn.commit()
    else:
        print(f"No data in {ticker} Skipping")
    
    if i < len(djia_tickers) - 1:
        time.sleep(12) 

try:


    # Export stock table
    stock_df = pd.read_sql("SELECT * FROM stock", conn)
    stock_df.to_csv(stock_table_path, index=False)

    # Export historical_stock table
    hs_df = pd.read_sql("SELECT ticker,hs_date,hs_open_price,hs_high,hs_low,hs_closing_price,hs_volume FROM historical_stock", conn)
    hs_df.to_csv(hs_table_path, index=False)


except Exception as e:
    print(f"Error: {e}")

cursor.close()
conn.close()
print("completed")