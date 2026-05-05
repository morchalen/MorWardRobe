package router

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/morwardrobe/api-server/internal/config"
	"github.com/morwardrobe/api-server/internal/handler"
	"github.com/morwardrobe/api-server/internal/lobster"
	"github.com/morwardrobe/api-server/internal/middleware"
	"github.com/morwardrobe/api-server/internal/service"
)

func Setup(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	middleware.SetDB(db)

	volcConfig := service.Config{
		AccessKeyID:     cfg.VolcEngine.AccessKeyID,
		SecretAccessKey: cfg.VolcEngine.SecretAccessKey,
	}
	volcService := service.NewVolcEngineService(volcConfig)

	public := r.Group("/v1")
	{
		authHandler := handler.NewAuthHandler(db, volcService)
		public.POST("/auth/register", authHandler.Register)
		public.POST("/auth/login", authHandler.Login)
		public.POST("/auth/logout", authHandler.Logout)

		r.GET("/healthz", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "version": "2.0.0"})
		})
	}

	protected := r.Group("/v1")
	protected.Use(middleware.AuthRequired())
	{
		authHandler := handler.NewAuthHandler(db, volcService)
		protected.GET("/auth/me", authHandler.GetMe)
		protected.POST("/auth/change-password", authHandler.ChangePassword)
		protected.GET("/auth/body-image", authHandler.GetBodyImage)
		protected.PUT("/auth/body-image", authHandler.UpdateBodyImage)

		clothingHandler := handler.NewClothingHandler(db)

		protected.GET("/clothes", clothingHandler.List)
		protected.GET("/clothes/:id", clothingHandler.GetByID)
		protected.POST("/clothes/upload", clothingHandler.Upload)
		protected.PUT("/clothes/:id", clothingHandler.Update)
		protected.DELETE("/clothes/:id", clothingHandler.Delete)
		protected.GET("/clothes/stats", clothingHandler.Stats)

		lobsterHandler := lobster.NewHandler(db)
		protected.POST("/lobster/chat", lobsterHandler.Chat)
		protected.GET("/lobster/recommend-outfit", lobsterHandler.RecommendOutfit)
		protected.POST("/lobster/rate-outfit", lobsterHandler.RateOutfit)

		admin := protected.Group("/admin")
		admin.Use(middleware.AdminRequired())
		{
			adminHandler := handler.NewAdminHandler(db)

			admin.GET("/dashboard", adminHandler.Dashboard)
			admin.GET("/users", adminHandler.ListUsers)
			admin.POST("/users", adminHandler.CreateUser)
			admin.PUT("/users/:id", adminHandler.UpdateUser)
			admin.PUT("/users/:id/role", adminHandler.UpdateUserRole)
			admin.PUT("/users/:id/status", adminHandler.UpdateUserStatus)
			admin.DELETE("/users/:id", adminHandler.DeleteUser)
			admin.DELETE("/users/:id/wardrobe", adminHandler.ClearUserWardrobe)
			admin.GET("/users/:id/clothes", adminHandler.GetUserClothes)
			admin.GET("/clothings", adminHandler.ListAllClothings)
		}
	}

	r.Static("/uploads", "./uploads")
}
