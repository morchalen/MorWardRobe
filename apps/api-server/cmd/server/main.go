package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/morwardrobe/api-server/internal/config"
	"github.com/morwardrobe/api-server/internal/middleware"
	"github.com/morwardrobe/api-server/internal/model"
	"github.com/morwardrobe/api-server/internal/router"
)

func main() {
	cfg := config.Load()

	db := cfg.Database.Connect()
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	if cfg.App.Env == "development" {
		err := db.AutoMigrate(
			&model.User{},
			&model.Clothing{},
		)
		if err != nil {
			log.Fatalf("Failed to migrate database: %v", err)
		}
	}

	r := gin.Default()

	r.Use(middleware.CORS())
	r.Use(middleware.RequestID())
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())

	router.Setup(r, db)

	port := cfg.App.Port
	log.Printf("🚀 Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
