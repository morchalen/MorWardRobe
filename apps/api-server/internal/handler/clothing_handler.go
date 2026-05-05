package handler

import (
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/morwardrobe/api-server/internal/model"
	"github.com/morwardrobe/api-server/internal/middleware"
	"github.com/morwardrobe/api-server/pkg/response"
)

type ClothingHandler struct {
	db        *gorm.DB
	uploadDir string
}

func NewClothingHandler(db *gorm.DB) *ClothingHandler {
	return &ClothingHandler{
		db:        db,
		uploadDir: "./uploads/images",
	}
}

func (h *ClothingHandler) List(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	category := c.Query("category")
	wardrobeType := c.DefaultQuery("wardrobe_type", "thin")
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := h.db.Model(&model.Clothing{}).Where("user_id = ? AND status = ?", userID, "active")

	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}
	if wardrobeType != "" && wardrobeType != "all" {
		query = query.Where("wardrobe_type = ?", wardrobeType)
	}
	if search != "" {
		query = query.Where("name LIKE ? OR color LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var clothes []model.Clothing
	offset := (page - 1) * perPage
	query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&clothes)

	response.Paginated(c, clothes, page, perPage, int(total))
}

func (h *ClothingHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	userID, _ := middleware.GetUserID(c)

	var clothing model.Clothing
	if err := h.db.Where("id = ? AND user_id = ?", id, userID).First(&clothing).Error; err != nil {
		response.NotFoundError(c, "Clothing")
		return
	}

	response.Success(c, clothing)
}

func (h *ClothingHandler) Upload(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	form, err := c.MultipartForm()
	if err != nil {
		response.Error(c, http.StatusBadRequest, 40001, "表单数据解析失败，请检查上传的文件格式")
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		response.Error(c, http.StatusBadRequest, 40001, "请选择要上传的衣物图片")
		return
	}

	// 验证文件类型
	file := files[0]
	ext := strings.ToLower(filepath.Ext(file.Filename))
	validExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true}
	if !validExts[ext] {
		response.Error(c, http.StatusBadRequest, 40002, "不支持的图片格式，请上传 JPG、PNG、WebP 或 GIF 格式的图片")
		return
	}

	// 验证文件大小（最大10MB）
	if file.Size > 10*1024*1024 {
		response.Error(c, http.StatusBadRequest, 40003, "图片文件过大，请选择不超过 10MB 的图片")
		return
	}

	category := form.Value["category"][0]
	if category == "" {
		response.Error(c, http.StatusBadRequest, 40004, "请选择衣物的分类（如：上衣、裤子等）")
		return
	}

	color := ""
	if len(form.Value["color"]) > 0 {
		color = form.Value["color"][0]
	} else {
		response.Error(c, http.StatusBadRequest, 40005, "请填写衣物的颜色")
		return
	}

	name := ""
	if len(form.Value["name"]) > 0 {
		name = form.Value["name"][0]
	}
	seasons := form.Value["seasons[]"]
	wardrobeType := c.DefaultQuery("wardrobe_type", "thin")

	filename := uuid.New().String() + ext
	savePath := filepath.Join(h.uploadDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		response.Error(c, http.StatusInternalServerError, 45002, "图片保存失败，请稍后重试或联系管理员")
		return
	}

	imageURL := "/uploads/images/" + filename

	clothing := model.Clothing{
		UserID:       userID,
		Name:         name,
		ImageURL:     imageURL,
		ThumbnailURL: imageURL,
		Category:     category,
		Color:        color,
		Seasons:      seasons,
		WardrobeType: wardrobeType,
		Status:       "active",
	}

	if err := h.db.Create(&clothing).Error; err != nil {
		// 判断是否是唯一性约束错误
		if strings.Contains(err.Error(), "UNIQUE constraint") || strings.Contains(err.Error(), "duplicate") {
			response.Error(c, http.StatusConflict, 40901, "该衣物已存在，请勿重复添加")
			return
		}
		response.InternalError(c, err)
		return
	}

	response.Created(c, gin.H{
		"message": "衣物添加成功！",
		"clothing_id": clothing.ID,
		"clothing_name": name,
		"tip": "您可以在「我的衣橱」中查看和管理这件新衣服",
	})
}

func (h *ClothingHandler) Update(c *gin.Context) {
	id := c.Param("id")
	userID, _ := middleware.GetUserID(c)

	var clothing model.Clothing
	if err := h.db.Where("id = ? AND user_id = ?", id, userID).First(&clothing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.NotFoundError(c, "Clothing")
		} else {
			response.InternalError(c, err)
		}
		return
	}

	var updates struct {
		Name     string   `json:"name"`
		Color    string   `json:"color"`
		Category string   `json:"category"`
		Seasons  []string `json:"seasons"`
	}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.ValidationError(c, err)
		return
	}

	if updates.Name != "" {
		clothing.Name = updates.Name
	}
	if updates.Color != "" {
		clothing.Color = updates.Color
	}
	if updates.Category != "" {
		clothing.Category = updates.Category
	}
	if len(updates.Seasons) > 0 {
		clothing.Seasons = updates.Seasons
	}

	if err := h.db.Save(&clothing).Error; err != nil {
		response.InternalError(c, err)
		return
	}

	response.Success(c, clothing)
}

func (h *ClothingHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	userID, _ := middleware.GetUserID(c)

	result := h.db.Model(&model.Clothing{}).Where("id = ? AND user_id = ?", id, userID).Update("status", "pending_removal")
	if result.Error != nil {
		response.InternalError(c, result.Error)
		return
	}

	if result.RowsAffected == 0 {
		response.NotFoundError(c, "Clothing")
		return
	}

	response.Success(c, gin.H{"message": "衣物已标记为待移出"})
}

func (h *ClothingHandler) Stats(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var total int64

	h.db.Model(&model.Clothing{}).Where("user_id = ? AND status = ?", userID, "active").Count(&total)

	response.Success(c, gin.H{
		"total": total,
	})
}
