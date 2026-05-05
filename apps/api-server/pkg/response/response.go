package response

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

type Meta struct {
	RequestID string `json:"request_id"`
	Timestamp string `json:"timestamp"`
}

type PaginatedData struct {
	Items      interface{} `json:"items"`
	Pagination Pagination  `json:"pagination"`
}

type Pagination struct {
	Page       int  `json:"page"`
	PerPage    int  `json:"per_page"`
	TotalItems int  `json:"total_items"`
	TotalPages int  `json:"total_pages"`
	HasNext    bool `json:"has_next"`
	HasPrev    bool `json:"has_prev"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "success",
		Data:    data,
		Meta: &Meta{
			RequestID: c.GetHeader("X-Request-ID"),
			Timestamp: currentTime(),
		},
	})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Code:    201,
		Message: "created",
		Data:    data,
		Meta: &Meta{
			RequestID: c.GetHeader("X-Request-ID"),
			Timestamp: currentTime(),
		},
	})
}

func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

func Paginated(c *gin.Context, items interface{}, page, perPage, total int) {
	totalPages := total / perPage
	if total%perPage > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "success",
		Data: PaginatedData{
			Items: items,
			Pagination: Pagination{
				Page:       page,
				PerPage:    perPage,
				TotalItems: total,
				TotalPages: totalPages,
				HasNext:    page < totalPages,
				HasPrev:    page > 1,
			},
		},
		Meta: &Meta{
			RequestID: c.GetHeader("X-Request-ID"),
			Timestamp: currentTime(),
		},
	})
}

func Error(c *gin.Context, httpCode int, errCode int, message string) {
	c.JSON(httpCode, gin.H{
		"code":    errCode,
		"error":   errorCodeToMessage(errCode),
		"message": message,
		"request_id": c.GetHeader("X-Request-ID"),
	})
}

func ValidationError(c *gin.Context, err error) {
	Error(c, http.StatusBadRequest, 40001, err.Error())
}

func UnauthorizedError(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, 70001, message)
}

func NotFoundError(c *gin.Context, resource string) {
	Error(c, http.StatusNotFound, 40004, resource+" not found")
}

func InternalError(c *gin.Context, err error) {
	Error(c, http.StatusInternalServerError, 50000, "Internal server error")
	// 生产环境应记录日志但不暴露细节
	if os.Getenv("APP_ENV") == "development" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"detail": err.Error(),
		})
	}
}

func currentTime() string {
	return time.Now().UTC().Format("2006-01-02T15:04:05Z07:00")
}

func errorCodeToMessage(code int) string {
	messages := map[int]string{
		40001: "VALIDATION_ERROR",
		40002: "INVALID_FILE_TYPE",
		40003: "FILE_SIZE_EXCEEDED",
		40004: "RESOURCE_NOT_FOUND",
		40101: "AUTH_TOKEN_EXPIRED",
		40102: "INVALID_TOKEN",
		40103: "INSUFFICIENT_PERMISSIONS",
		40901: "DUPLICATE_RESOURCE",
		42900: "RATE_LIMIT_EXCEEDED",
		50000: "INTERNAL_ERROR",
	}
	if msg, ok := messages[code]; ok {
		return msg
	}
	return "UNKNOWN_ERROR"
}
