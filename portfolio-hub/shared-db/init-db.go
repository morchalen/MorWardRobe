package main

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "wardrobe.db")
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	defer db.Close()

	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		avatar_url TEXT,
		role TEXT DEFAULT 'user',
		is_active BOOLEAN DEFAULT 1,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err = db.Exec(createUsersTable)
	if err != nil {
		log.Fatal("Failed to create users table:", err)
	}

	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Fatal("Failed to count users:", err)
	}

	if count == 0 {
		insertAdmin := `
		INSERT INTO users (id, email, password_hash, role, is_active)
		VALUES ('admin-user-id-001', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'admin', 1);
		`
		_, err = db.Exec(insertAdmin)
		if err != nil {
			log.Fatal("Failed to insert admin user:", err)
		}
		log.Println("Created admin user: admin@example.com / 123456")
	}

	log.Println("Database initialized successfully")
}
