package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/morwardrobe/api-server/internal/model"
	"github.com/morwardrobe/api-server/pkg/response"
)

// AdminRequired 管理员权限中间件
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			response.UnauthorizedError(c, "Missing user ID")
			c.Abort()
			return
		}

		var user model.User
		if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
			response.NotFoundError(c, "User")
			c.Abort()
			return
		}

		if user.Role != "admin" {
			response.Error(c, http.StatusForbidden, 40103, "Insufficient permissions")
			c.Abort()
			return
		}

		c.Set("admin_user", user)
		c.Next()
	}
}

// 全局数据库连接（需要在main.go中初始化）
var db *gorm.DB

func SetDB(database *gorm.DB) {
	db = database
}
