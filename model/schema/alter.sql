SET SCHEMA 'public';
ALTER TABLE account
    ADD PRIMARY KEY (account_id),
    ALTER COLUMN account_id 
        ADD GENERATED ALWAYS AS IDENTITY;
-- ADD PRIMARY KEY (account_id) SET DEFAULT NEXTVAL('account_id_seq');

ALTER TABLE profile
    ADD PRIMARY KEY (profile_id), 
    ALTER COLUMN profile_id 
        ADD GENERATED ALWAYS AS IDENTITY,
    ADD FOREIGN KEY (account_id)
        REFERENCES account(account_id);
  	
ALTER TABLE address_info
    ADD PRIMARY KEY (address_info_id),
    ALTER COLUMN address_info_id 
        ADD GENERATED ALWAYS AS IDENTITY;

ALTER TABLE address
    ADD PRIMARY KEY (address_id), 
    ALTER COLUMN address_id 
        ADD GENERATED ALWAYS AS IDENTITY,
    ADD FOREIGN KEY (profile_id)
        REFERENCES profile(profile_id),
    ADD FOREIGN KEY (address_info_id)
        REFERENCES address_info(address_info_id);

ALTER TABLE top_up
    ADD PRIMARY KEY (top_up_id),
    ALTER COLUMN top_up_id 
        ADD GENERATED ALWAYS AS IDENTITY,
    ADD FOREIGN KEY (account_id)
        REFERENCES account(account_id);

ALTER TABLE account_currency
    ADD PRIMARY KEY (currency_id),
    ALTER COLUMN currency_id 
        ADD GENERATED ALWAYS AS IDENTITY,
    ADD FOREIGN KEY (account_id)
        REFERENCES account(account_id);

ALTER TABLE user_rating
    ADD PRIMARY KEY (rating_id),
    ALTER COLUMN rating_id 
        ADD GENERATED ALWAYS AS IDENTITY,
    ADD FOREIGN KEY (rating_to)
        REFERENCES account(account_id),
    ADD FOREIGN KEY (rating_by)
        REFERENCES account(account_id),
    ADD FOREIGN KEY (item_id)
        REFERENCES item(item_id);

ALTER TABLE item
    ADD PRIMARY KEY (item_id),
    ALTER COLUMN item_id 
        ADD GENERATED ALWAYS AS IDENTITY;
ALTER TABLE inventory
    ADD PRIMARY KEY (inventory_id),
    ALTER COLUMN inventory_id 
        ADD GENERATED ALWAYS AS IDENTITY,
    ADD FOREIGN KEY (account_id)
        REFERENCES account(account_id),
    ADD FOREIGN KEY (item_id)
        REFERENCES item(item_id);

-- USE EXCLUSION CONSTRAINTS FOR DATES!
ALTER TABLE reservation
    ADD PRIMARY KEY (reservation_id),
    ALTER COLUMN reservation_id 
	    ADD GENERATED ALWAYS AS IDENTITY,
    ADD CONSTRAINT inventory_rental_constraint UNIQUE (inventory_id, reservation_date);

ALTER TABLE rental
    ADD PRIMARY KEY (rental_id),
    ALTER COLUMN rental_id 
        ADD GENERATED ALWAYS AS IDENTITY;

ALTER TABLE payment
    ADD PRIMARY KEY (payment_id),
    ALTER COLUMN payment_id 
        ADD GENERATED ALWAYS AS IDENTITY,
    ADD FOREIGN KEY (rental_id)
        REFERENCES rental (rental_id),
    ADD FOREIGN KEY (owner_id)
        REFERENCES account(account_id);

ALTER TABLE rental
    ADD FOREIGN KEY (owner_id)
        REFERENCES account(account_id),
    ADD FOREIGN KEY (customer_id)
        REFERENCES account(account_id),
    ADD FOREIGN KEY (inventory_id)
        REFERENCES inventory(inventory_id),
    ADD FOREIGN KEY (payment_id)
        REFERENCES payment(payment_id);

--ALTER TABLE item_category
--    ADD FOREIGN KEY (item_id)
--        REFERENCES item(item_id);

ALTER TABLE category
    ADD PRIMARY KEY (category_id),
    ALTER COLUMN category_id
        ADD GENERATED ALWAYS AS IDENTITY;

ALTER TABLE cart
    ADD PRIMARY KEY (cart_id),
    ALTER COLUMN cart_id
        ADD GENERATED ALWAYS AS IDENTITY;

ALTER TABLE item_performance
    ADD FOREIGN KEY (item_id)
        REFERENCES item (item_id);

