---------------------- Set All Primary Keys ----------------------
-- For table "user"
ALTER TABLE "user" ADD PRIMARY KEY (U_USER_ID);

-- For table WATCHLIST
ALTER TABLE WATCHLIST ADD PRIMARY KEY (W_WATCHLIST_ID);

-- For table STOCK
ALTER TABLE STOCK ADD PRIMARY KEY (S_STOCK_ID);

-- For table WATCHLIST_STOCKS
ALTER TABLE WATCHLIST_STOCKS ADD PRIMARY KEY (WS_WATCHLIST_ID, WS_STOCK_ID);

-- For table HISTORICAL_STOCK
ALTER TABLE HISTORICAL_STOCK ADD PRIMARY KEY (HS_RECORD_ID);

-- For table admin
ALTER TABLE "admin" ADD PRIMARY KEY (A_ADMIN_ID);

COMMIT WORK;
---------------------------------------------------------------

----------------------- Admin IS A User -----------------------
ALTER TABLE "admin" ADD FOREIGN KEY (A_ADMIN_ID) references "user" (U_USER_ID);

COMMIT WORK;
---------------------------------------------------------------

--------- User -> Watchlist Relationship (One to Many) ---------
ALTER TABLE WATCHLIST ADD FOREIGN KEY (W_USER_ID) references "user" (U_USER_ID);

COMMIT WORK;
----------------------------------------------------------------

--------- Watchlist -> Stock Relationship (Many to Many) ---------
ALTER TABLE WATCHLIST_STOCKS ADD FOREIGN KEY (WS_WATCHLIST_ID) references WATCHLIST (W_WATCHLIST_ID),
ADD FOREIGN KEY (WS_STOCK_ID) references STOCK (S_STOCK_ID);

COMMIT WORK;
-----------------------------------------------------------------

--------- Stock -> Historical Stock Relationship (One to One) ---------
ALTER TABLE HISTORICAL_STOCK ADD FOREIGN KEY (HS_RECORD_ID) references STOCK (S_STOCK_ID);

COMMIT WORK;
-----------------------------------------------------------------------