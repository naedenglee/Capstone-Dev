SET SCHEMA 'public';
CREATE FUNCTION trigger_signup()
RETURNS trigger AS $$
BEGIN
    IF NEW.c1 IS NULL OR NEW.c1 ='' THEN
        NEW.c := 'X';
    END IF;
    RETURN NEW;

END;
$$ LANGUAGE 'plpgsql'


CREATE TRIGGER trigger_user_currency
BEFORE INSERT ON register
FOR EACH ROW 
EXECUTE PROCEDURE trigger_signup()
