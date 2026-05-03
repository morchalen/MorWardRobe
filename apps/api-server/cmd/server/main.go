package main

import (
	"log"

	"github.com/smartwardrobe/api-server/internal/config"
	"github.com/smartwardrobe/api-server/internal/middleware"
	"github.com/smartwardrobe/api-server/internal/router"
	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化数据库
	db := cfg.Database.InitDB()
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	// 自动迁移（开发环境）
	if cfg.App.Env == "development" {
		err := db.AutoMigrate(
			&config.User{},
			&config.UserProfile{},
			&config.Clothing{},
			&config.Folder{},
		)
		if err != nil {
			log.Fatalf("Failed to migrate database: %v", err)
		}
	}

	// 创建Gin引擎
	r := gin.Default()

	// 全局中间件
	r.Use(middleware.CORS())
	r.Use(middleware.RequestID())
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())

	// 注册路由
	router.Setup(r, db, cfg)

	// 启动服务器
	port := cfg.App.Port
	log.Printf("🚀 Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
