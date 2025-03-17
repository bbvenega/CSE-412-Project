--------- User -> Watchlist Relationship (One to Many) ---------
-- For table "user"
ALTER TABLE "user"
ADD PRIMARY KEY (U_USER_ID);

-- For table WATCHLIST
ALTER TABLE WATCHLIST
ADD PRIMARY KEY (W_WATCHLIST_ID);

ALTER TABLE WATCHLIST
ADD FOREIGN KEY(W_USER_ID) references "user"(U_USER_ID);

COMMIT WORK;
----------------------------------------------------------------

--------- Watchlist -> Stock Relationship (One to Many) ---------

-- For table STOCK
ALTER TABLE STOCK
ADD PRIMARY KEY (S_STOCK_ID);

ALTER TABLE STOCK
ADD FOREIGN KEY(S_WATCHLIST_ID) references WATCHLIST(W_WATCHLIST_ID);

COMMIT WORK;
-----------------------------------------------------------------

--------- Stock -> Historical Stock Relationship (One to One) ---------

ALTER TABLE HISTORICAL_STOCK
ADD FOREIGN KEY(HS_RECORD_ID) references STOCK;

COMMIT WORK;
-----------------------------------------------------------------------