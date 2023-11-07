CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION generate_uid(size INT) RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes BYTEA := gen_random_bytes(size);
  l INT := length(characters);
  i INT := 0;
  output TEXT := '';
BEGIN
  WHILE i < size LOOP
    output := output || substr(characters, get_byte(bytes, i) % l + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN output;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE users (
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name VARCHAR(255) NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users RENAME COLUMN user_id TO id;
ALTER TABLE users RENAME COLUMN user_name TO name;
ALTER TABLE users RENAME COLUMN user_password TO password;

CREATE TABLE channels (
  channel_id TEXT PRIMARY KEY DEFAULT generate_uid(5),
  channel_name TEXT NOT NULL
);

ALTER TABLE channels RENAME COLUMN channel_id TO id;
ALTER TABLE channels RENAME COLUMN channel_name TO name;

CREATE TABLE messages (
  message_id TEXT PRIMARY KEY DEFAULT generate_uid(15),
  message_text TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  post_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- change the column from NOT NULL to NULL 
-- change data type from text to uuid
-- change to foreign key
-- set col to NOT NULL
ALTER TABLE messages ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE messages ALTER COLUMN user_id SET DATA TYPE UUID USING user_id::UUID;
ALTER TABLE messages 
   ADD CONSTRAINT fk_link_user_id
   FOREIGN KEY (user_id) 
   REFERENCES users(id);
ALTER TABLE messages ALTER COLUMN user_id SET NOT NULL;


ALTER TABLE messages ALTER COLUMN channel_id DROP NOT NULL;
ALTER TABLE messages 
   ADD CONSTRAINT fk_link_channel_id
   FOREIGN KEY (channel_id) 
   REFERENCES channels(id);
ALTER TABLE messages ALTER COLUMN channel_id SET NOT NULL;

ALTER TABLE messages RENAME COLUMN message_id TO id;
ALTER TABLE messages RENAME COLUMN message_text TO text;
ALTER TABLE messages RENAME COLUMN post_time TO created_at;
ALTER TABLE messages DROP COLUMN user_name;
ALTER TABLE messages DROP COLUMN channel_name;

TRUNCATE messages; 
DELETE FROM messages;
DROP TABLE IF EXISTS messages;

INSERT INTO users (name, password) VALUES ('ben', '123');

INSERT INTO channels (name) VALUES ('General');

SELECT * FROM users;