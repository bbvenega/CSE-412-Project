-- Drops all tables in database if they already exist
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS watchlist_stocks CASCADE;
DROP TABLE IF EXISTS "Admins" CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS historical_stock CASCADE;


-- Creates the User table with:
--  U_User_ID: Integer
--  U_Username: A string of 25 characters or less
--  U_Email: A string of 25 characters or less
--  U_Password: A string of 25 characters or less
CREATE TABLE
    "Users" (
        U_USER_ID INTEGER PRIMARY KEY,
        U_USERNAME CHAR(25) NOT NULL UNIQUE,
        U_EMAIL CHAR(25) NOT NULL UNIQUE,
        U_PASSWORD CHAR(25) NOT NULL
    );

-- Creates the Watchlist table with:
--  A_Admin_ID: Integer
CREATE TABLE "Admins" (
	A_ADMIN_ID INTEGER PRIMARY KEY,
	FOREIGN KEY (A_ADMIN_ID) REFERENCES "Users"(U_USER_ID) ON DELETE CASCADE
);

-- Creates the Stock table with:
CREATE TABLE STOCK (
    S_TICKER VARCHAR(10) PRIMARY KEY,
    S_COMPANY_NAME CHAR(25) NOT NULL
);

COPY stock (S_TICKER, S_COMPANY_NAME)
FROM '/YourPath/stock.csv'
DELIMITER ','
CSV HEADER;


CREATE TABLE
    HISTORICAL_STOCK (
	    HS_ID INTEGER PRIMARY KEY,
	    TICKER VARCHAR(10) NOT NULL,
	    HS_DATE DATE NOT NULL,
	    HS_OPEN_PRICE NUMERIC NOT NULL,
	    HS_HIGH NUMERIC NOT NULL,
	    HS_LOW NUMERIC NOT NULL,
		HS_CLOSING_PRICE NUMERIC NOT NULL,
		HS_VOLUME BIGINT,
	FOREIGN KEY (TICKER) REFERENCES STOCK(S_TICKER) ON DELETE CASCADE
    );

COPY HISTORICAL_STOCK (TICKER, HS_DATE, HS_OPEN_PRICE, HS_HIGH, HS_LOW, HS_CLOSING_PRICE, HS_VOLUME)
FROM '/YourPath/stock_prices.csv'
DELIMITER ','
CSV HEADER;


-- Creates the Watchlist table with:    Each user can have one or more watchlists, and each watchlist will have a unique ID
-- W_WATCHLIST_ID: Unique ID for each watchlist.
-- W_USER_ID: Links the watchlist to a specific user.
-- W_NAME: Users can input name of watchlist
-- ON DELETE CASCADE: Deletes the user's watchlists if the user is deleted.
CREATE TABLE WATCHLIST (
    W_WATCHLIST_ID INTEGER PRIMARY KEY,
    W_USER_ID INTEGER NOT NULL,
    W_NAME CHAR(25) NOT NULL,
    FOREIGN KEY (W_USER_ID) REFERENCES "Users"(U_USER_ID) ON DELETE CASCADE
);

-- Creates the Watchlist_Stocks table which acts as a linker between watchlists and stocks with:
CREATE TABLE WATCHLIST_STOCKS (
    WS_WATCHLIST_ID INTEGER NOT NULL,
    WS_STOCK_ID VARCHAR(10) NOT NULL,
    PRIMARY KEY (WS_WATCHLIST_ID, WS_STOCK_ID),
    FOREIGN KEY (WS_WATCHLIST_ID) REFERENCES WATCHLIST(W_WATCHLIST_ID) ON DELETE CASCADE,
    FOREIGN KEY (WS_STOCK_ID) REFERENCES STOCK(S_TICKER) ON DELETE CASCADE
);
