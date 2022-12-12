INSERT INTO inventory (
    inventory_id, 
    account_id,
    item_id,
    item_quantity,
    item_status,
    last_update
)
SELECT generate_series(1,100),
       (random() * (0)+100)::integer,
       (random() * (0)+100)::integer,
       (random() * (0)+4)::integer,
        substr(md5(random()) FROM 0 FOR 1)::text,
       DATE '2022-10-01' + (random() * 70)::integer
FROM generate_series(1, 100);

substr(md5(random()::text), 1),
       (random() * 70 + 10)::integer,


SELECT 
    LEFT(md5(i::int), 10),
    md5(random()::text),
    md5(random()::text),
    LEFT(md5(random()::text), 4),
FROM generate_series(1, 100) s(i)


INSERT INTO milliontable (name, age, joindate)
SELECT substr(md5(random()::text), 1, 10),
       (random() * 70 + 10)::integer,
       DATE '2018-01-01' + (random() * 700)::integer
FROM generate_series(1, 1000000);
