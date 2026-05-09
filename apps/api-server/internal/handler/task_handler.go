package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/morwardrobe/api-server/internal/model"
	"github.com/morwardrobe/api-server/internal/middleware"
	"github.com/morwardrobe/api-server/pkg/response"
)

type TaskHandler struct {
	db *gorm.DB
}

func NewTaskHandler(db *gorm.DB) *TaskHandler {
	return &TaskHandler{db: db}
}

func (h *TaskHandler) List(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var tasks []model.Task
	if err := h.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&tasks).Error; err != nil {
		response.InternalError(c, err)
		return
	}

	if tasks == nil {
		tasks = []model.Task{}
	}

	response.Success(c, gin.H{"tasks": tasks})
}

func (h *TaskHandler) Create(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var req struct {
		Content  string `json:"content" binding:"required"`
		Quadrant string `json:"quadrant" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err)
		return
	}

	validQuadrants := map[string]bool{
		"academic": true, "work": true, "reality": true, "entertainment": true,
	}
	if !validQuadrants[req.Quadrant] {
		response.Error(c, http.StatusBadRequest, 40001, "无效的象限类型")
		return
	}

	task := model.Task{
		UserID:    userID,
		Content:   req.Content,
		Quadrant:  req.Quadrant,
		CreatedAt: currentMillis(),
	}

	if err := h.db.Create(&task).Error; err != nil {
		response.InternalError(c, err)
		return
	}

	response.Created(c, task)
}

func (h *TaskHandler) Update(c *gin.Context) {
	id := c.Param("id")
	userID, _ := middleware.GetUserID(c)

	var task model.Task
	if err := h.db.Where("id = ? AND user_id = ?", id, userID).First(&task).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.NotFoundError(c, "Task")
		} else {
			response.InternalError(c, err)
		}
		return
	}

	var req struct {
		IsCompleted *bool `json:"is_completed"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err)
		return
	}

	if req.IsCompleted != nil {
		task.IsCompleted = *req.IsCompleted
		if *req.IsCompleted {
			task.CompletedAt = currentMillis()
		} else {
			task.CompletedAt = 0
		}
	}

	if err := h.db.Save(&task).Error; err != nil {
		response.InternalError(c, err)
		return
	}

	response.Success(c, task)
}

func (h *TaskHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	userID, _ := middleware.GetUserID(c)

	result := h.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Task{})
	if result.Error != nil {
		response.InternalError(c, result.Error)
		return
	}

	if result.RowsAffected == 0 {
		response.NotFoundError(c, "Task")
		return
	}

	response.Success(c, gin.H{"message": "任务已删除"})
}

func currentMillis() int64 {
	return time.Now().UnixMilli()
}
