SET SCHEMA 'public';
CREATE TABLE account(
    account_id INT NOT NULL,  -- PRIMARY KEY
    username VARCHAR(48) NOT NULL UNIQUE, 
    password VARCHAR(80) NOT NULL,
    email VARCHAR(80)
);

CREATE TABLE profile(
    profile_id INT NOT NULL, -- PRIMARY KEY
    account_id INT NOT NULL, -- FOREIGN KEY
    first_name VARCHAR(32),
    middle_name VARCHAR(32),
    last_name VARCHAR(32),
    birthdate DATE,
    phone_num VARCHAR(13),
    is_verified INT 
);

CREATE TABLE address(
    address_id INT NOT NULL, -- PRIMARY KEY
    profile_id INT NOT NULL, -- FOREIGN KEY
    address_info_id INT, -- FOREIGN KEY
    full_name VARCHAR(150),
    phone_num VARCHAR(13),
    address_type CHAR(1)
);


CREATE TABLE address_info(
    address_info_id INT NOT NULL, -- PRIMARY KEY
    region VARCHAR(45),
    city VARCHAR(50),
    postal_code VARCHAR(5),
    street_name VARCHAR(50),
    house_number VARCHAR(50)
);


CREATE TABLE top_up (
    top_up_id INT NOT NULL, -- PRIMARY KEY
    account_id INT NOT NULL,  -- FOREIGN KEY
    amount FLOAT,
    status CHAR(1),
    last_update DATE
);


CREATE TABLE account_currency(
    currency_id INT NOT NULL, -- PRIMARY KEY
    account_id INT NOT NULL, -- FOREIGN KEY
    user_currency FLOAT
);


CREATE TABLE user_rating(
    rating_id INT NOT NULL, -- PRIMARY KEY
    rating_to INT NOT NULL, -- FOREIGN KEY
    rating_by INT NOT NULL, -- FOREIGN KEY
    rating FLOAT NOT NULL 
);


CREATE TABLE item(
    item_id INT NOT NULL, -- PRIMARY KEY
    item_name VARCHAR(45) NOT NULL,
    item_category VARCHAR(45) NOT NULL, -- FOREIGN KEY
    item_description VARCHAR(45),
    rental_rate FLOAT,
    replacement_cost FLOAT,
    date_posted DATE,
    last_update DATE,
    image_path VARCHAR(45)
);

CREATE TABLE inventory(
    inventory_id INT NOT NULL, -- PRIMARY KEY
    account_id INT NOT NULL, -- FOREIGN KEY
    item_id INT NOT NULL, -- FOREIGN KEY
    item_quantity INT, 
    item_status CHAR(1) DEFAULT '1',
    last_update DATE
);

-- USE EXCLUSION CONSTRAINTS FOR DATES!

CREATE TABLE rental(
    rental_id INT NOT NULL, -- PRIMARY KEY
    owner_id INT NOT NULL, -- FOREIGN KEY
    customer_id INT NOT NULL, -- FOREIGN KEY
    inventory_id INT NOT NULL, -- FOREIGN KEY
    payment_id INT UNIQUE, -- FOREIGN KEY
    rental_date DATE NOT NULL,
    return_date DATE NOT NULL,
    rental_status CHAR(1),
    last_update DATE
);

CREATE EXTENSION btree_gist;
CREATE TABLE reservation(
    reservation_id INT NOT NULL, -- PRIMARY KEY
    inventory_id INT NOT NULL, -- FOREIGN KEY
    customer_id INT NOT NULL, -- FOREIGN KEY
    reservation_date DATERANGE,
    reservation_start DATE NOT NULL,
    reservation_end DATE NOT NULL,
    reserve_status CHAR(1),
    last_update DATE,

  	EXCLUDE USING gist (
		inventory_id WITH =,
		reservation_date WITH &&
	)
);      


CREATE TABLE payment(
    payment_id INT NOT NULL, -- PRIMARY KEY
    rental_id INT NOT NULL, -- FOREIGN KEY
    owner_id INT NOT NULL, -- FOREIGN KEY
    customer_id INT NOT NULL, -- FOREIGN KEY
    amount FLOAT NOT NULL,
    payment_date DATE NOT NULL,
    payment_type CHAR(1) NOT NULL,
    payment_status CHAR(1)
);


CREATE TABLE category(
    category_id INT NOT NULL,
    category VARCHAR(50) NOT NULL
);

CREATE TABLE cart(
    cart_id INT NOT NULL,
    account_id INT NOT NULL,
    item_id INT NOT NULL, -- FK 
    qty INT 
)

CREATE TABLE test_table(
    test VARCHAR(50),
    id INT
)
