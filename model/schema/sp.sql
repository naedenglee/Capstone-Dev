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
--DROP PROCEDURE IF EXISTS check_login (IN CHARACTER VARYING, OUT vpassword CHARACTER VARYING, OUT vid INT);
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
    INSERT INTO item_performance (item_id) -- FOR PRODUCT PERFORMANCE
    VALUES(vitem_id);
	END IF;
	COMMIT;
END $$;

-- PROCEDURE FOR RESERVATION 
-- HOW TO CALL: CALL check_reservation(inventory id, customer_id, 'start date', 'end date');
   
--CREATE OR REPLACE PROCEDURE check_reservation (IN OUT vinventory_id  INT, INT, DATE, DATE)
--LANGUAGE 'plpgsql'
--AS $$
--BEGIN
--	INSERT INTO reservation (inventory_id, customer_id, 
--                            reservation_date, reservation_start, 
--                            reservation_end, reserve_status, last_update)
--	VALUES ($1, $2, daterange($3::DATE, $4::DATE), $3, $4, NULL, CURRENT_DATE)
--	ON CONFLICT (inventory_id, reservation_date)
--	DO NOTHING
--	--RETURNING inventory_id INTO vinventory_id
--    vinventory_id = NULL
--	COMMIT;
--END $$;

CREATE OR REPLACE PROCEDURE check_reservation_test(
    IN OUT vinventory_id  INT, 
    INT, vquantity INT, 
    INT, DATE, DATE)
LANGUAGE 'plpgsql'
AS $$
BEGIN
	IF EXISTS(
        SELECT inventory_id
        FROM inventory 
        WHERE inventory_id = $1
        AND $3 <= item_quantity
    )
    THEN
        INSERT INTO reservation (inventory_id, owner_id, quantity, customer_id, 
                                reservation_date, reservation_start, 
                                reservation_end, reserve_status, last_update)
        VALUES ($1, $2, $3, $4, daterange($5::DATE, $6::DATE), $5, $6, NULL, CURRENT_DATE)
        ON CONFLICT (inventory_id, reservation_date) 
        WHERE reserve_status <> NULL
        DO NOTHING
        RETURNING inventory_id INTO vinventory_id;
        COMMIT;
    ELSE
        vinventory_id:= NULL
        ROLLBACK;
    END IF;
END $$;

 DROP PROCEDURE IF EXISTS public.check_reservation_test(integer, integer, integer, integer, date, date);

CREATE OR REPLACE PROCEDURE public.check_reservation_test(
    INOUT vinventory_id integer,
    IN integer,
    IN vquantity integer,
    IN integer,
    IN date,
    IN date,
    IN integer)
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
    IF EXISTS(
        SELECT inventory_id
        FROM inventory 
        WHERE inventory_id = $1
        AND $3 <= item_quantity
    )
    THEN
        INSERT INTO reservation (inventory_id, owner_id, quantity, customer_id, 
                                reservation_date, reservation_start, 
                                reservation_end, mode_of_payment, reserve_status, last_update)
        VALUES ($1, $2, $3, $4, daterange($5::DATE, $6::DATE), $5, $6,$7, NULL, CURRENT_DATE)
        RETURNING inventory_id INTO vinventory_id;
        COMMIT;
    ELSE
        ROLLBACK;
    END IF;
END 
$BODY$;

ALTER PROCEDURE public.check_reservation(integer, integer, integer, integer, date, date, integer)
    OWNER TO naedenglee_user;

-- !!FOR REVISION!! --
CREATE OR REPLACE PROCEDURE update_reservation_status (IN INT, IN OUT INT)
LANGUAGE 'plpgsql'
AS $$
BEGIN 	
	--UPDATE reservation 
	--SET reserve_status = $1
	--WHERE reservation_id = $2
	--RETURNING reserve_status INTO $3;
	--COMMIT;
    UPDATE reservation 
    SET reserve_status = reserve_status + 1 
    WHERE reservation_id = ($1) 
    AND reserve_status = ($2);
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


CREATE OR REPLACE FUNCTION top_graph (INT)
RETURNS TABLE (
    s_id INT, search_rate INT,
    d_id INT, detail_rate INT,
    u_id INT, unique_rental INT,
    item_name CHARACTER VARYING
)
AS $$
    SELECT graph.*, b.item_name
    FROM (
        SELECT *
        FROM(
            SELECT item_id AS s_id, search_rate -- QUERIES TOP 3 SEARCHED 
            FROM item_performance 
            WHERE account_id = $1
            ORDER BY search_rate DESC
            LIMIT 3
        ) t1
        FULL JOIN (
            SELECT item_id AS d_id, detail_rate -- QUERIES TOP 3 VIEWS
            FROM item_performance 
            WHERE account_id = $1
            ORDER BY detail_rate DESC
            LIMIT 3
        ) t2
        ON s_id=d_id
        FULL JOIN (
            SELECT item_id AS u_id, unique_rental -- QUERIES TOP 3 SUCCESSFUL RENT
            FROM item_performance 
            WHERE account_id = $1
            ORDER BY unique_rental DESC
            LIMIT 3
        ) t3
        ON d_id = u_id
    ) AS graph
    LEFT JOIN item b
    ON s_id = b.item_id 
    OR d_id = b.item_id 
    OR u_id = b.item_id 
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION () -- FOR THE BLOCKS
RETURNS TABLE (
    products INT, purchase_order INT,
    sales_order INT, lifetime_sales INT, 
)

    SELECT DISTINCT account_id, 
        COUNT(item_id) OVER (PARTITION BY account_id ) AS products
        COUNT(reservation_id) 
    SELECT DISTINCT account_id, 
        (SELECT DISTINCT owner_id, COUNT(reservation_id) OVER (PARTITION BY owner_id) FROM reservation WHERE reserve_status = 5) 
    FROM inventory
    ORDER BY account_id;

    SELECT DISTINCT  account_id, COUNT(a.item_id)
    LEFT JOIN reservation b
    ON b.owner_id = a.account_id
    GROUP BY account_id
    ORDER BY account_id;

    SELECT owner_id, reservation_id, reserve_status 
    FROM reservation 
    ORDER BY owner_id ASC

-- PRODUCTS 
SELECT DISTINCT account_id, COUNT(item_id)
FROM inventory
GROUP BY account_id
ORDER BY account_id ASC;

-- PURCHASE ORDERS 
SELECT DISTINCT owner_id, COUNT(reservation_id)
FROM reservation 
WHERE reserve_status IS NULL
GROUP BY owner_id
ORDER BY owner_id ASC;


-- SALES ORDERS 
SELECT account_id, owner_id, COUNT(DISTINCT(reservation_id))
FROM reservation a 
LEFT JOIN inventory b
ON a.owner_id = account_id
WHERE reserve_status < 5 AND reserve_status IS NOT NULL
GROUP BY owner_id, account_id
ORDER BY owner_id ASC;

-- LIFETIME SALES
SELECT  a.owner_id, a.reservation_id, 
        c.rental_rate, 
        EXTRACT(DAY FROM AGE(reservation_end, reservation_start)),
        EXTRACT(DAY FROM AGE(reservation_end, reservation_start)) * rental_rate AS profit,
FROM reservation a
LEFT JOIN inventory b
ON a.owner_id = b.account_id
LEFT JOIN item c
ON b.item_id = c.item_id
WHERE reserve_status = 5
ORDER BY owner_id ASC;

SELECT  a.owner_id,
        SUM(EXTRACT(DAY FROM AGE(reservation_end, reservation_start)) * rental_rate) AS profit
FROM reservation a
LEFT JOIN inventory b
ON a.owner_id = b.account_id
LEFT JOIN item c
ON b.item_id = c.item_id
WHERE reserve_status = 5
GROUP BY a.owner_id
ORDER BY owner_id ASC;



        SELECT SUM() ::DECIMAL(100,2))*100),2) AS sr_percent,

        SELECT owner_id, reservation_id,
        SUM((EXTRACT(DAY FROM AGE(reservation_end, reservation_start)) * rental_rate) * quantity) OVER (PARTITION BY owner_id ) AS lifetime_sales
        FROM reservation
        LEFT JOIN item b
        ON item_id = b.item_id

CREATE OR REPLACE FUNCTION dashboard_summary (INT)
RETURNS TABLE (
    account_id INT, 
    lifetime_sales FLOAT,
    sales_orders INT, 
    purchase_orders INT,
    products INT
)
AS $$
SELECT  totals.pr_id AS account_id, 
        COALESCE( NULLIF(totals.lifetime_sales, NULL) ,0) AS lifetime_sales,
        COALESCE( NULLIF(totals.sales_orders, NULL) ,0) AS sales_orders,
        COALESCE( NULLIF(totals.purchase_orders, NULL) ,0) AS purchase_orders,
        COALESCE( NULLIF(totals.products, NULL) ,0) AS products
FROM (
    SELECT *
    FROM(
        SELECT DISTINCT account_id AS pr_id, COUNT(item_id) AS products
        FROM inventory
        GROUP BY account_id
        ORDER BY account_id ASC
    ) t1
    FULL JOIN (
        SELECT  a.owner_id, b.account_id AS l_id,
                SUM((rental_rate * (reservation_end - reservation_start)) *a.quantity) as lifetime_sales
                 --SUM(((EXTRACT(DAY FROM AGE(reservation_end, reservation_start)) * rental_rate)* quantity)) AS lifetime_sales
        FROM reservation a
        LEFT JOIN inventory b
        ON a.inventory_id = b.inventory_id
        LEFT JOIN item c
        ON b.item_id = c.item_id
        WHERE reserve_status = 5
        GROUP BY a.owner_id, b.account_id
        ORDER BY owner_id ASC
    ) t2
    ON pr_id = l_id
    FULL JOIN (
        SELECT account_id, owner_id AS s_id, COUNT(DISTINCT(reservation_id)) AS sales_orders
        FROM reservation a 
        LEFT JOIN inventory b
        ON a.owner_id = account_id
        WHERE reserve_status < 5 AND reserve_status IS NOT NULL
        GROUP BY owner_id, account_id
        ORDER BY owner_id ASC
    ) t3
    ON pr_id = s_id 
    FULL JOIN (
        SELECT DISTINCT owner_id as p_id, COUNT(reservation_id) AS purchase_orders
        FROM reservation 
        WHERE reserve_status IS NULL
        GROUP BY owner_id
        ORDER BY owner_id ASC
    ) t4
    ON pr_id = p_id
) AS totals
WHERE totals.pr_id = $1;
$$ LANGUAGE SQL;




AS $$
$$ LANGUAGE SQL;

-- REPORTS PAGE

NOT NULL
CREATE OR REPLACE FUNCTION googol_reports()
RETURNS TABLE (
    item_name CHARACTER VARYING, item_id INT,
    account_id INT, search_rate INT,
    detail_rate INT, add_cart INT, 
    rm_cart INT, reservations INT,
    unique_rental INT, last_update DATE,
    sr_percent FLOAT, dr_percent FLOAT,
    ac_percent FLOAT, rm_percent FLOAT,
    res_percent FLOAT, ur_percent FLOAT,
    a2d_percent FLOAT, u2d_percent FLOAT
)
AS $$
    SELECT b.item_name, a.*,
        round((search_rate/(SUM(search_rate) OVER (PARTITION BY account_id )::DECIMAL(100,2))*100),2) AS sr_percent,
        round((detail_rate/(SUM(detail_rate) OVER (PARTITION BY account_id )::DECIMAL(100,2))*100),2) AS dr_percent,
        round((add_cart/(SUM(add_cart) OVER (PARTITION BY account_id )::DECIMAL(100,2))*100),2) AS ac_percent,
        round((rm_cart/(SUM(rm_cart) OVER (PARTITION BY account_id )::DECIMAL(100,2))*100),2) AS rm_percent,
        round((reservations/(SUM(reservations) OVER (PARTITION BY account_id )::DECIMAL(100,2))*100),2) AS res_percent,
        round((unique_rental/(SUM(unique_rental) OVER (PARTITION BY account_id )::DECIMAL(100,2))*100),2) AS ur_percent,
        round((LEAD(add_cart,0) OVER (PARTITION BY account_id)/LEAD(detail_rate,0) OVER (PARTITION BY account_id )::DECIMAL(100,2)*100),2) AS a2d_percent,
        round((LEAD(unique_rental,0) OVER (PARTITION BY account_id)/LEAD(detail_rate,0) OVER (PARTITION BY account_id )::DECIMAL(100,2)*100),2) AS u2d_percent
    FROM item_performance a 
    LEFT JOIN item b 
    ON a.item_id = b.item_id
    ORDER BY account_id;
$$ LANGUAGE SQL;


CREATE OR REPLACE FUNCTION total_reports(IN INT)
RETURNS TABLE (
    sr_sum INT, dr_sum INT,
    ac_sum INT, rm_sum INT, 
    res_sum INT, uq_sum INT,
    a2d_percent FLOAT, 
    u2d_percent FLOAT
)
AS $$

    SELECT 
        SUM(search_rate) AS sr_sum,
        SUM(detail_rate) AS dr_sum,
        SUM(add_cart) AS ac_sum,
        SUM(rm_cart) AS rm_sum,
        SUM(reservations) AS res_sum,
        SUM(unique_rental) AS ur_sum,
        round((SUM(add_cart)/SUM(detail_rate)::DECIMAL(100,2)*100),2) AS a2d_percentage,
        round((SUM(unique_rental)/SUM(detail_rate)::DECIMAL(100,2)*100),2) AS u2d_percentage
    FROM item_performance
    WHERE account_id = $1
    GROUP BY account_id;
$$ LANGUAGE SQL;


---- WISHLIST VS RESERVATION PER MONTH
SELECT SUM(reservations) AS Reservation, SUM(add_cart) AS Wishlist 
FROM item_performance a
    RIGHT JOIN inventory b
    ON a.item_id = b.item_id 
    RIGHT JOIN item c
    ON a.item_id = c.item_id
WHERE a.last_update BETWEEN '2022-12-1' AND '2022-12-31' AND b.account_id =1
GROUP BY account_id
ORDER BY a.account)id




SELECT account_id,
    SUM(reservations) AS total_reservations,
    SUM(add_cart) AS total_wishlist
FROM 
    item_performance

GROUP BY
    account_id
ORDER BY 
    account_id ASC;




SELECT 
    COUNT(reservation_id) OVER (PARTITION BY owner_id) 
FROM reservation WHERE reserve_status = 5) 

SELECT date_part('month',  reservation_start) AS month
FROM reservation
GROUP BY month 
ORDER BY month ASC




















-- RESERVATION ORDERS
SELECT COUNT(reservation_id), to_char(date_trunc('month', reservation_end), 'Mon') as month FROM reservation WHERE owner_id =2 GROUP BY month;
SELECT COUNT(notification_type), to_char(date_trunc('month', notification_date), 'Month') as r_month FROM notification  WHERE notification_type = 1 GROUP BY month;



SELECT COUNT(reservation_id), to_char(date_trunc('month', reservation_end), 'Month') as r_month FROM reservation WHERE owner_id =2 GROUP BY r_month ORDER BY to_date(to_char(date_trunc('month', reservation_end), 'Month'), 'Month');
SELECT COUNT(notification_type), to_char(date_trunc('month', notification_date), 'Month') as w_month FROM notification WHERE owner_id =2  AND notification_type = 1 GROUP BY w_month ORDER BY to_date(to_char(date_trunc('month', notification_date), 'Month'), 'Month');




                    SELECT  a.reservation_id, a.owner_id, d.first_name, d.last_name, d.phone_num,
                            a.inventory_id, c.item_id,  
                            c.item_name, image_path, 
                            reservation_start, reservation_end , 
                            DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                            quantity, a.reserve_status, mode_of_payment, rental_rate, replacement_cost,
                            (rental_rate * (reservation_end - reservation_start)* quantity) + (a.quantity * replacement_cost) as total_amount 
                    FROM reservation a 
                    JOIN inventory b 
                    ON b.inventory_id = a.inventory_id 
                    JOIN item c 
                    ON c.item_id = b.item_id 
                    JOIN profile d
                    ON a.owner_id  = d.account_id
                    WHERE customer_id = ($1) AND reserve_status IS NULL




                    SELECT  a.reservation_id, a.owner_id, d.first_name, d.last_name, d.phone_num, 
                            a.inventory_id, c.item_id,  
                            c.item_name, image_path, 
                            reservation_start, reservation_end , 
                            DATE_PART('day', a.reservation_end::timestamp - a.reservation_start::timestamp) as days_remaining,
                            quantity, a.reserve_status, mode_of_payment, rental_rate, replacement_cost,
                            (rental_rate * (reservation_end - reservation_start)* quantity) + (a.quantity * replacement_cost) as total_amount 
                    FROM reservation a 
                    JOIN inventory b 
                    ON b.inventory_id = a.inventory_id 
                    JOIN item c 
                    ON c.item_id = b.item_id 
                    JOIN profile d
                    ON a.owner_id  = d.account_id
                    WHERE customer_id = 2 
                    AND reserve_status IS NULL
                    AND reservation_start >= CURRENT_DATE 

