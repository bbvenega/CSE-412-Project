-- Creates the User table with:
--  U_User_ID: Integer
--  U_Username: A string of 25 characters or less
--  U_Email: A string of 25 characters or less
--  U_Password: A string of 25 characters or less
CREATE TABLE
    "user" (
        U_USER_ID INTEGER NOT NULL UNIQUE,
        U_USERNAME CHAR(25) NOT NULL,
        U_EMAIL CHAR(25) NOT NULL,
        U_PASSWORD CHAR(25) NOT NULL
    );

-- Creates the Watchlist table with:
--  W_Watchlist_ID: Integer ~ Primary key for watchlist
--  W_USER_ID: Integer ~ Foreign key reference to user table.
CREATE TABLE
    WATCHLIST (
        W_WATCHLIST_ID INTEGER NOT NULL UNIQUE,
        -- ADDED THIS! 
        W_USER_ID INTEGER NOT NULL UNIQUE
        --
    );

-- Creates the Watchlist_Stocks table which acts as a linker between watchlists and stocks with:
-- WS_WATCHLIST_ID: Integer ~ Foreign key that references it's watchlist
-- WS_STOCK_ID: Integer ~ Foreign key that references the stock
CREATE TABLE
    WATCHLIST_STOCKS (
        WS_WATCHLIST_ID INTEGER NOT NULL UNIQUE,
        WS_STOCK_ID INTEGER NOT NULL UNIQUE
    );

-- Creates the Watchlist table with:
--  A_Admin_ID: Integer
CREATE TABLE
    "admin" (A_ADMIN_ID INTEGER NOT NULL UNIQUE);

-- Creates the Stock table with:
--  S_Stock_ID: Integer
--  S_Watchlist_ID: Integer ~ Foreign key reference to WATCHLIST table.
--  S_Company_Name: A string of 25 characters or less
--  S_Curr_Price, S_DAILY_HIGH, S_DAILY_LOW, S_WEEK_HIGH, S_WEEK_LOW:
--      A decimal value with 2 digits after decimal point 
CREATE TABLE
    STOCK (
        S_STOCK_ID INTEGER NOT NULL UNIQUE,
        -- ADDED THIS! 
        S_WATCHLIST_ID INTEGER NOT NULL,
        --
        S_COMPANY_NAME CHAR(25) NOT NULL,
        S_CURR_PRICE DECIMAL(15, 2) NOT NULL,
        S_CLOSING_PRICE DECIMAL(15, 2) NOT NULL,
        S_DAILY_HIGH DECIMAL(15, 2) NOT NULL,
        S_DAILY_LOW DECIMAL(15, 2) NOT NULL,
        S_WEEK_HIGH DECIMAL(15, 2) NOT NULL,
        S_WEEK_LOW DECIMAL(15, 2) NOT NULL
    );

-- Creates the Historical Stock table with:
--  HS_Record_ID: Integer ~ Foreign key reference to STOCK
--  HS_Data: A string of 25 characters or less
--  HS_OPEN_PRICE, HS_CLOSING_PRICE, HS_HIGH, HS_LOW:
--      A decimal value with 2 digits after decimal point 
CREATE TABLE
    HISTORICAL_STOCK (
        HS_RECORD_ID INTEGER NOT NULL UNIQUE,
        HS_DATA CHAR(25) NOT NULL,
        HS_OPEN_PRICE DECIMAL(15, 2) NOT NULL,
        HS_CLOSING_PRICE DECIMAL(15, 2) NOT NULL,
        HS_HIGH DECIMAL(15, 2) NOT NULL,
        HS_LOW DECIMAL(15, 2) NOT NULL
    );