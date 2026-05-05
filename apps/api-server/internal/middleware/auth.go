package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/morwardrobe/api-server/pkg/response"
)

var jwtSecret = []byte("morwardrobe-dev-secret-change-in-production")

// AuthRequired JWT认证中间件
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.UnauthorizedError(c, "Missing authorization header")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.UnauthorizedError(c, "Invalid authorization format")
			c.Abort()
			return
		}

		tokenString := parts[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			response.UnauthorizedError(c, "Invalid or expired token")
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			response.UnauthorizedError(c, "Invalid token claims")
			c.Abort()
			return
		}

		userID, exists := claims["sub"]
		if !exists {
			response.UnauthorizedError(c, "Missing user ID in token")
			c.Abort()
			return
		}

		// 将userID存入context供后续handler使用
		c.Set("user_id", userID.(string))
		c.Next()
	}
}

// GetUserID 从context获取当前用户ID
func GetUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return "", false
	}
	return userID.(string), true
}
