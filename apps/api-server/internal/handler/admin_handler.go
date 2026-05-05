package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/morwardrobe/api-server/internal/model"
	"github.com/morwardrobe/api-server/pkg/response"
)

type AdminHandler struct {
	db *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

func (h *AdminHandler) Dashboard(c *gin.Context) {
	var userCount int64
	h.db.Model(&model.User{}).Count(&userCount)

	var clothingCount int64
	h.db.Model(&model.Clothing{}).Count(&clothingCount)

	response.Success(c, gin.H{
		"user_count":     userCount,
		"clothing_count": clothingCount,
	})
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	search := c.Query("search")
	role := c.Query("role")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := h.db.Model(&model.User{})

	if search != "" {
		query = query.Where("email LIKE ?", "%"+search+"%")
	}
	if role != "" {
		query = query.Where("role = ?", role)
	}

	var total int64
	query.Count(&total)

	log.Printf("[管理] 查询用户列表: page=%d, perPage=%d, search=%s, role=%s, total=%d", page, perPage, search, role, total)

	var users []model.User
	offset := (page - 1) * perPage
	query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&users)

	log.Printf("[管理] 查询到 %d 个用户", len(users))

	type safeUser struct {
		ID        string `json:"id"`
		Email     string `json:"email"`
		Role      string `json:"role"`
		IsActive  bool   `json:"is_active"`
		CreatedAt string `json:"created_at"`
	}

	result := make([]safeUser, len(users))
	for i, u := range users {
		result[i] = safeUser{
			ID:        u.ID,
			Email:     u.Email,
			Role:      u.Role,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	response.Paginated(c, result, page, perPage, int(total))
}

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role"`
}

func (h *AdminHandler) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, 40001, err.Error())
		return
	}

	var existing model.User
	if h.db.Where("email = ?", req.Email).First(&existing).Error == nil {
		response.Error(c, http.StatusConflict, 40901, "Email already exists")
		return
	}

	role := "user"
	if req.Role == "admin" {
		role = "admin"
	}

	user := model.User{
		Email:        req.Email,
		PasswordHash: req.Password,
		Role:         role,
		IsActive:     true,
	}

	if result := h.db.Create(&user); result.Error != nil {
		response.InternalError(c, result.Error)
		return
	}

	response.Success(c, gin.H{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
	})
}

type UpdateUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func (h *AdminHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user model.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, 40001, err.Error())
		return
	}

	updates := map[string]interface{}{}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Password != "" {
		updates["password_hash"] = req.Password
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}

	if len(updates) > 0 {
		if err := h.db.Model(&user).Updates(updates).Error; err != nil {
			response.InternalError(c, err)
			return
		}
	}

	response.Success(c, gin.H{"message": "User updated successfully"})
}

type UpdateRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	id := c.Param("id")

	var user model.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, 40001, err.Error())
		return
	}

	if req.Role != "user" && req.Role != "admin" {
		response.Error(c, http.StatusBadRequest, 40001, "Role must be 'user' or 'admin'")
		return
	}

	h.db.Model(&user).Update("role", req.Role)
	response.Success(c, gin.H{"message": "User role updated successfully"})
}

type UpdateStatusRequest struct {
	IsActive bool `json:"is_active"`
}

func (h *AdminHandler) UpdateUserStatus(c *gin.Context) {
	id := c.Param("id")

	var user model.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, 40001, err.Error())
		return
	}

	h.db.Model(&user).Update("is_active", req.IsActive)
	response.Success(c, gin.H{"message": "User status updated successfully"})
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user model.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	h.db.Where("user_id = ?", id).Delete(&model.Clothing{})
	h.db.Delete(&user)

	response.Success(c, gin.H{"message": "User deleted successfully"})
}

func (h *AdminHandler) ClearUserWardrobe(c *gin.Context) {
	id := c.Param("id")

	var user model.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	result := h.db.Where("user_id = ?", id).Delete(&model.Clothing{})
	if result.Error != nil {
		response.InternalError(c, result.Error)
		return
	}

	response.Success(c, gin.H{
		"message":       "User wardrobe cleared successfully",
		"deleted_count": result.RowsAffected,
	})
}

func (h *AdminHandler) ListAllClothings(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	search := c.Query("search")
	category := c.Query("category")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := h.db.Model(&model.Clothing{})

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	if category != "" {
		query = query.Where("category = ?", category)
	}

	var total int64
	query.Count(&total)

	var clothes []model.Clothing
	offset := (page - 1) * perPage
	query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&clothes)

	response.Paginated(c, clothes, page, perPage, int(total))
}

func (h *AdminHandler) GetUserClothes(c *gin.Context) {
	id := c.Param("id")

	var user model.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	var total int64
	h.db.Model(&model.Clothing{}).Where("user_id = ?", id).Count(&total)

	var clothes []model.Clothing
	offset := (page - 1) * perPage
	h.db.Where("user_id = ?", id).Order("created_at DESC").Offset(offset).Limit(perPage).Find(&clothes)

	response.Paginated(c, clothes, page, perPage, int(total))
}
