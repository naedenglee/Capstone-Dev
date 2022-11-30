SET SCHEMA 'public';
-- HOW TO CALL: CALL register('username', 'password', 'email', 'fname','mname','lname', 'bday', 'phonenum', NULL);
CREATE OR REPLACE PROCEDURE register(CHARACTER VARYING, CHARACTER VARYING, 
                                    CHARACTER VARYING, CHARACTER VARYING, 
                                    CHARACTER VARYING, CHARACTER VARYING, 
                                    DATE, CHARACTER VARYING, 
                                    OUT vaccount_id INT)
LANGUAGE 'plpgsql'
AS $$
DECLARE 
BEGIN
	INSERT INTO account (username, password, email)
	SELECT username, password, email
	FROM (VALUES ($1, $2, $3)) as v(username, password, email)	
	WHERE NOT EXISTS (SELECT 1 FROM account a WHERE a.username = v.username)
	RETURNING account.account_id INTO vaccount_id;
	IF vaccount_id IS NULL 
	THEN 
		ROLLBACK;
	ELSE
		INSERT INTO profile (account_id, first_name, middle_name, last_name, birthdate, phone_num)
		VALUES (vaccount_id, $4, $5, $6, $7, $8);		
        INSERT INTO account_currency (account_id)   
        VALUES (vaccount_id);
	END IF;
COMMIT;
END $$; 

-- PROCEDURE FOR LOG IN
-- HOW TO CALL:CALL check_login('username', 'password', NULL); 
DROP PROCEDURE IF EXISTS check_login (IN CHARACTER VARYING, OUT vpassword CHARACTER VARYING, OUT vid INT);
CREATE OR REPLACE PROCEDURE check_login (IN CHARACTER VARYING, OUT vpassword CHARACTER VARYING, OUT vid INT)
LANGUAGE 'plpgsql'
AS $$
DECLARE 
BEGIN
	SELECT account_id, password INTO vid, vpassword FROM account 
	WHERE username = $1;
END$$;


-- STORED PROC FOR SHOWING ITEMS
CREATE OR REPLACE FUNCTION view_item(INT) 
  RETURNS TABLE(item_id INT, account_id INT, item_quantity INT, 
  				item_name CHARACTER VARYING, item_category CHARACTER VARYING, 
  				item_description CHARACTER VARYING, rental_rate FLOAT, 
  				replacement_cost FLOAT, date_posted DATE, image_path CHARACTER VARYING)
AS $$
  SELECT -- 
		a.item_id,
		a.account_id,
		a.item_quantity,
		b.item_name,
		b.item_category,
		b.item_description,
		b.rental_rate,
		b.replacement_cost,
		b.date_posted,
        b.image_path
	FROM inventory a
	LEFT JOIN item b 
		ON a.item_id = b.item_id
	WHERE a.item_id = $1
	LIMIT 1;
$$ LANGUAGE SQL;

-- STORED PROC FOR CHECKING DATES
-- HOW TO CALL: SELECT * FROM check_available(item_id)
CREATE OR REPLACE FUNCTION check_available (INT)
RETURNS TABLE (start_date TEXT, end_date TEXT)
AS $$
	SELECT LOWER(reservation_date) AS start_date, UPPER(reservation_date) AS end_date 
	FROM reservation a
	LEFT JOIN inventory b
	ON a.inventory_id = b.inventory_id
	WHERE b.item_id = $1;
$$ LANGUAGE SQL;


-- HOW TO CALL:  CALL item_insert('Blue Dress', 1, 'Blue Prom Dress', 300, 1500, '/', 1, 2, null);
CREATE OR REPLACE PROCEDURE item_insert
	(CHARACTER VARYING, CHARACTER VARYING, CHARACTER VARYING, -- 1item_name, 2item_category, 3description
	FLOAT, FLOAT, TEXT, INT,  --4rental_rate, 5replacement_cost, 6 image_path, 7 quantity
	vaccount_id INT, OUT vitem_id INT)
LANGUAGE 'plpgsql'
AS $$
BEGIN
	INSERT INTO item 
	(item_name, item_category, 
	item_description, rental_rate, 
	replacement_cost, date_posted, 
	last_update, image_path)
	VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE, $6)
	RETURNING item_id INTO vitem_id;
	IF vitem_id IS NULL 
	THEN 
		ROLLBACK;
	ELSE
	INSERT INTO inventory 
	(account_id, item_id, 
	item_quantity, item_status,
	last_update)
	VALUES (vaccount_id, vitem_id, $7, NULL, CURRENT_DATE);
	END IF;
	COMMIT;
END $$;

-- PROCEDURE FOR RESERVATION 
-- HOW TO CALL: CALL check_reservation(inventory id, customer_id, 'start date', 'end date');
CREATE OR REPLACE PROCEDURE check_reservation (IN OUT vinventory_id  INT, INT, DATE, DATE)
LANGUAGE 'plpgsql'
AS $$
BEGIN
	INSERT INTO reservation (inventory_id, customer_id, 
                            reservation_date, reservation_start, 
                            reservation_end, reserve_status, last_update)
	VALUES ($1, $2, daterange($3::DATE, $4::DATE), $3, $4, NULL, CURRENT_DATE)
	ON CONFLICT (inventory_id, reservation_date)
	DO NOTHING
	RETURNING inventory_id INTO vinventory_id
	COMMIT;
END $$;

-- !!FOR REVISION!! --
CREATE OR REPLACE PROCEDURE update_reservation_status (IN INT, IN INT, OUT INT)
LANGUAGE 'plpgsql'
AS $$
BEGIN 	
	UPDATE reservation 
	SET reserve_status = $1
	WHERE reservation_id = $2



	RETURNING reserve_status INTO $3;
	COMMIT;
END $$;



-- HOW TO CALL: CALL update_verify_profile(session.user, null);
CREATE OR REPLACE PROCEDURE update_verify_profile (IN INT, OUT vis_verified INT)
LANGUAGE 'plpgsql'
AS $$
BEGIN 
    UPDATE profile
    SET is_verified = 1
    WHERE account_id = $1
    RETURNING is_verified INTO vis_verified;
    COMMIT;
END $$;

