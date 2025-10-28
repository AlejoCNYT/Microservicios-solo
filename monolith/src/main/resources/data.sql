-- Crea si no existen (H2)
MERGE INTO users (id, email, username) KEY(id) VALUES (1, 'alice@example.com', 'alice');
MERGE INTO stream_topic (id, name) KEY(id) VALUES (1, 'general');