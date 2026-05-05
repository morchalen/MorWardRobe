package handler

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/png"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nfnt/resize"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/morwardrobe/api-server/internal/middleware"
	"github.com/morwardrobe/api-server/internal/model"
	"github.com/morwardrobe/api-server/internal/service"
	"github.com/morwardrobe/api-server/pkg/response"
)

var jwtSecret = []byte("morwardrobe-dev-secret-change-in-production")

type AuthHandler struct {
	db                *gorm.DB
	volcEngineService *service.VolcEngineService
}

func NewAuthHandler(db *gorm.DB, volcService *service.VolcEngineService) *AuthHandler {
	return &AuthHandler{
		db:                db,
		volcEngineService: volcService,
	}
}

type registerRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// POST /v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err)
		return
	}

	var existingUser model.User
	if result := h.db.Where("email = ?", req.Email).First(&existingUser); result.RowsAffected > 0 {
		response.Error(c, http.StatusConflict, 40901, "该邮箱已被注册")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.InternalError(c, err)
		return
	}

	user := model.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		IsActive:     true,
		Role:         "admin",
	}

	if err := h.db.Create(&user).Error; err != nil {
		response.InternalError(c, err)
		return
	}

	tokenData := generateTokenPair(user.ID)

	response.Created(c, gin.H{
		"access_token":  tokenData.AccessToken,
		"refresh_token": tokenData.RefreshToken,
		"expires_in":    86400,
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"avatar_url": user.AvatarURL,
			"role":       user.Role,
			"created_at": user.CreatedAt.Format(time.RFC3339),
		},
	})
}

// POST /v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err)
		return
	}

	var user model.User
	if err := h.db.Where("email = ? AND is_active = ?", req.Email, true).First(&user).Error; err != nil {
		response.UnauthorizedError(c, "邮箱或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		response.UnauthorizedError(c, "密码错误，请重新输入")
		return
	}

	tokenData := generateTokenPair(user.ID)

	response.Success(c, gin.H{
		"access_token":  tokenData.AccessToken,
		"refresh_token": tokenData.RefreshToken,
		"expires_in":    86400,
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"avatar_url": user.AvatarURL,
			"role":       user.Role,
			"created_at": user.CreatedAt.Format(time.RFC3339),
		},
	})
}

// POST /v1/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	response.NoContent(c)
}

// GET /v1/auth/me
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var user model.User
	if err := h.db.Select("id, email, avatar_url, role, is_active, created_at").First(&user, "id = ?", userID).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	response.Success(c, gin.H{
		"id":         user.ID,
		"email":      user.Email,
		"avatar_url": user.AvatarURL,
		"role":       user.Role,
		"is_active":  user.IsActive,
		"created_at": user.CreatedAt.Format(time.RFC3339),
	})
}

// PUT /v1/auth/body-image
func (h *AuthHandler) UpdateBodyImage(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	form, err := c.MultipartForm()
	if err != nil {
		response.Error(c, http.StatusBadRequest, 40001, "请上传有效的图片文件")
		return
	}

	files := form.File["image"]
	if len(files) == 0 {
		response.Error(c, http.StatusBadRequest, 40001, "请选择要上传的图片")
		return
	}

	file := files[0]
	ext := ".png"
	switch filepath.Ext(file.Filename) {
	case ".jpg", ".jpeg", ".png", ".webp":
		ext = filepath.Ext(file.Filename)
	}

	// 1. 先保存原始图片（临时文件）
	filename := "body_" + userID + "_original" + ext
	savePath := filepath.Join("./uploads/images", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		response.InternalError(c, err)
		return
	}
	fmt.Println("[DEBUG] 原始图片保存成功，用户ID:", userID, ", 路径:", savePath)

	// 2. 读取原始图片并压缩到2MB以下
	imgFile, err := os.Open(savePath)
	if err != nil {
		response.InternalError(c, err)
		return
	}
	defer imgFile.Close()

	img, _, err := image.Decode(imgFile)
	if err != nil {
		response.InternalError(c, err)
		return
	}

	// 压缩图片到目标大小（约2MB）
	compressedBytes, err := compressImageToSize(img, 2*1024*1024) // 2MB
	if err != nil {
		response.InternalError(c, err)
		return
	}
	fmt.Println("[DEBUG] 图片压缩成功，用户ID:", userID, ", 压缩后大小:", len(compressedBytes), "bytes")

	imgBase64 := base64.StdEncoding.EncodeToString(compressedBytes)
	fmt.Println("[DEBUG] 图片转base64成功，用户ID:", userID, ", 数据长度:", len(imgBase64), "bytes")

	// 3. 调用火山引擎API进行分割
	fmt.Println("[DEBUG] ===== 开始调用火山引擎主体分割API ===== 用户ID:", userID)
	segResult, err := h.volcEngineService.SegmentImage(imgBase64)
	if err != nil {
		fmt.Println("[DEBUG] ===== 火山引擎API调用失败 ===== 用户ID:", userID, ", 错误:", err.Error())
		// 如果分割失败，使用原始图片
		imageURL := "/uploads/images/" + filename
		h.db.Model(&model.User{}).Where("id = ?", userID).Update("body_image_url", imageURL)
		response.Success(c, gin.H{
			"body_image_url": imageURL,
			"message":        "人体图片上传成功（分割服务暂时不可用）",
		})
		return
	}
	fmt.Println("[DEBUG] ===== 火山引擎API调用成功 ===== 用户ID:", userID, ", 返回数据长度:", len(segResult), "bytes")

	// 4. 保存分割后的图片（覆盖模式：固定文件名 body_{userID}.png）
	segFilename := "body_" + userID + ".png"
	segSavePath := filepath.Join("./uploads/images", segFilename)
	fmt.Println("[DEBUG] 准备保存分割图片，用户ID:", userID, ", 路径:", segSavePath)

	segData, err := base64.StdEncoding.DecodeString(segResult)
	if err != nil {
		fmt.Println("[DEBUG] 分割结果解码失败，用户ID:", userID, ", 错误:", err.Error())
		imageURL := "/uploads/images/" + filename
		h.db.Model(&model.User{}).Where("id = ?", userID).Update("body_image_url", imageURL)
		response.Success(c, gin.H{
			"body_image_url": imageURL,
			"message":        "人体图片上传成功（解码失败，已保存原图）",
		})
		return
	}

	if err := os.WriteFile(segSavePath, segData, 0644); err != nil {
		fmt.Println("[DEBUG] 分割图片保存失败，用户ID:", userID, ", 错误:", err.Error())
		imageURL := "/uploads/images/" + filename
		h.db.Model(&model.User{}).Where("id = ?", userID).Update("body_image_url", imageURL)
		response.Success(c, gin.H{
			"body_image_url": imageURL,
			"message":        "人体图片上传成功（保存失败，已保存原图）",
		})
		return
	}
	fmt.Println("[DEBUG] 分割图片保存成功，用户ID:", userID, ", 文件大小:", len(segData), "bytes")

	// 5. 删除临时原始图片
	_ = os.Remove(savePath)
	fmt.Println("[DEBUG] 临时原始图片已删除，用户ID:", userID)

	// 6. 保存URL到数据库（覆盖模式）
	imageURL := "/uploads/images/" + segFilename
	h.db.Model(&model.User{}).Where("id = ?", userID).Update("body_image_url", imageURL)
	fmt.Println("[DEBUG] 数据库更新成功，用户ID:", userID, ", 图片URL:", imageURL)

	response.Success(c, gin.H{
		"body_image_url": imageURL,
		"message":        "人体图片上传成功，已由火山引擎模型分割处理",
	})
}

// GET /v1/auth/body-image
func (h *AuthHandler) GetBodyImage(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var user model.User
	if err := h.db.Select("body_image_url").First(&user, "id = ?", userID).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	response.Success(c, gin.H{
		"body_image_url": user.BodyImageURL,
	})
}

// POST /v1/auth/change-password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err)
		return
	}

	var user model.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		response.NotFoundError(c, "User")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		response.Error(c, http.StatusBadRequest, 40001, "当前密码输入错误")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		response.InternalError(c, err)
		return
	}

	h.db.Model(&user).Update("password_hash", string(hashedPassword))

	response.Success(c, gin.H{"message": "Password changed successfully"})
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}

func generateTokenPair(userID string) TokenPair {
	now := time.Now()

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"exp":  now.Add(24 * time.Hour).Unix(),
		"iat":  now.Unix(),
		"type": "access",
	})
	accessTokenString, _ := accessToken.SignedString(jwtSecret)

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  userID,
		"exp":  now.Add(7 * 24 * time.Hour).Unix(),
		"iat":  now.Unix(),
		"type": "refresh",
	})
	refreshTokenString, _ := refreshToken.SignedString(jwtSecret)

	return TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}
}

// compressImageToSize 压缩图片到指定大小以下（字节）
func compressImageToSize(img image.Image, maxSizeBytes int) ([]byte, error) {
	// 先尝试调整尺寸
	originalBounds := img.Bounds()
	width := uint(originalBounds.Dx())
	height := uint(originalBounds.Dy())

	// 计算目标尺寸（按比例缩小）
	targetWidth := width
	targetHeight := height
	maxPixels := uint(2048 * 2048) // 最大像素数限制
	if width*height > maxPixels {
		scale := float64(maxPixels) / float64(width*height)
		targetWidth = uint(float64(width) * scale)
		targetHeight = uint(float64(height) * scale)
	}

	// 调整尺寸
	resizedImg := resize.Resize(targetWidth, targetHeight, img, resize.Lanczos3)

	// 尝试不同质量压缩
	for quality := 90; quality >= 20; quality -= 10 {
		var buf bytes.Buffer
		err := jpeg.Encode(&buf, resizedImg, &jpeg.Options{Quality: quality})
		if err != nil {
			return nil, err
		}
		if buf.Len() <= maxSizeBytes {
			return buf.Bytes(), nil
		}
	}

	// 如果还是太大，继续缩小尺寸
	for scale := 0.8; scale >= 0.2; scale -= 0.1 {
		smallerWidth := uint(float64(targetWidth) * scale)
		smallerHeight := uint(float64(targetHeight) * scale)
		if smallerWidth < 128 || smallerHeight < 128 {
			break
		}
		smallerImg := resize.Resize(smallerWidth, smallerHeight, img, resize.Lanczos3)

		for quality := 80; quality >= 20; quality -= 10 {
			var buf bytes.Buffer
			err := jpeg.Encode(&buf, smallerImg, &jpeg.Options{Quality: quality})
			if err != nil {
				return nil, err
			}
			if buf.Len() <= maxSizeBytes {
				return buf.Bytes(), nil
			}
		}
	}

	return nil, fmt.Errorf("无法将图片压缩到 %d 字节以下", maxSizeBytes)
}
