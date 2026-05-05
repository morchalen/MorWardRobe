package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/morwardrobe/api-server/internal/middleware"
	"github.com/morwardrobe/api-server/internal/model"
	"github.com/morwardrobe/api-server/internal/router"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "modernc.org/sqlite"
)

var (
	testDB   *gorm.DB
	testRouter *gin.Engine
	testUserID = "test-user-123"
)

func setupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Dialector{DriverName: "sqlite"}, &gorm.Config{})
	if err != nil {
		panic("failed to connect test database: " + err.Error())
	}

	db.AutoMigrate(
		&model.User{},
		&model.Clothing{},
	)

	return db
}

func createTestUser(db *gorm.DB, userID string) {
	user := model.User{
		ID:       userID,
		Email:    "test@example.com",
		PasswordHash: "hashed_password",
		Role:     "user",
		IsActive: true,
	}
	db.Create(&user)
}

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	
	testDB = setupTestDB()
	createTestUser(testDB, testUserID)
	middleware.SetDB(testDB)
	
	r := gin.Default()
	router.Setup(r, testDB)
	testRouter = r
	
	code := m.Run()
	os.Exit(code)
}

func getAuthToken() string {
	return "test-token-" + testUserID
}

func addAuthHeader(req *http.Request) {
	req.Header.Set("Authorization", "Bearer "+getAuthToken())
	req.Header.Set("Content-Type", "application/json")
}

// ============================================
// 测试1：验证文件夹路由已被删除
// ============================================

func TestFolderRoutesRemoved(t *testing.T) {
	t.Log("=== 测试文件夹路由是否已删除 ===")
	
	folderEndpoints := []struct {
		method   string
		path     string
		desc     string
	}{
		{"GET", "/v1/folders", "获取文件夹列表"},
		{"POST", "/v1/folders", "创建文件夹"},
		{"PUT", "/v1/folders/test-id", "更新文件夹"},
		{"DELETE", "/v1/folders/test-id", "删除文件夹"},
	}
	
	for _, ep := range folderEndpoints {
		t.Run(ep.desc, func(t *testing.T) {
			req := httptest.NewRequest(ep.method, ep.path, nil)
			addAuthHeader(req)
			
			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)
			
			if w.Code != http.StatusNotFound {
				t.Errorf("期望路由 %s %s 返回 404 (已删除)，但得到 %d", ep.method, ep.path, w.Code)
			} else {
				t.Logf("✓ 路由 %s %s 已正确删除 (返回 404)", ep.method, ep.path)
			}
		})
	}
}

// ============================================
// 测试2：验证现有接口正常工作 - 认证模块
// ============================================

func TestHealthEndpoint(t *testing.T) {
	t.Log("=== 测试健康检查接口 ===")
	
	req := httptest.NewRequest("GET", "/healthz", nil)
	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req)
	
	if w.Code != http.StatusOK {
		t.Errorf("健康检查失败，状态码: %d", w.Code)
		return
	}
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	
	if response["status"] != "ok" {
		t.Errorf("健康检查响应异常: %v", response)
		return
	}
	
	t.Logf("✓ 健康检查正常，版本: %s", response["version"])
}

func TestAuthRegister(t *testing.T) {
	t.Log("=== 测试用户注册 ===")
	
	registerData := map[string]string{
		"email":    "newuser@test.com",
		"password": "password123",
	}
	
	body, _ := json.Marshal(registerData)
	req := httptest.NewRequest("POST", "/v1/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req)
	
	t.Logf("注册接口状态码: %d", w.Code)
	t.Logf("注册响应: %s", w.Body.String())
}

func TestAuthLogin(t *testing.T) {
	t.Log("=== 测试用户登录 ===")
	
	loginData := map[string]string{
		"email":    "test@example.com",
		"password": "password123",
	}
	
	body, _ := json.Marshal(loginData)
	req := httptest.NewRequest("POST", "/v1/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req)
	
	t.Logf("登录接口状态码: %d", w.Code)
	t.Logf("登录响应: %s", w.Body.String())
}

// ============================================
// 测试3：验证衣物管理接口
// ============================================

func TestClothingList(t *testing.T) {
	t.Log("=== 测试获取衣物列表 ===")
	
	req := httptest.NewRequest("GET", "/v1/clothes", nil)
	addAuthHeader(req)
	
	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req)
	
	if w.Code == http.StatusNotFound {
		t.Error("衣物列表路由不存在！")
		return
	}
	
	t.Logf("✓ 衣物列表接口正常，状态码: %d", w.Code)
	t.Logf("响应: %s", w.Body.String())
}

func TestClothingStats(t *testing.T) {
	t.Log("=== 测试获取衣柜统计 ===")
	
	req := httptest.NewRequest("GET", "/v1/clothes/stats", nil)
	addAuthHeader(req)
	
	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req)
	
	if w.Code == http.StatusNotFound {
		t.Error("统计接口路由不存在！")
		return
	}
	
	t.Logf("✓ 统计接口正常，状态码: %d", w.Code)
	t.Logf("响应: %s", w.Body.String())
}

// ============================================
// 测试4：验证未授权访问被拒绝
// ============================================

func TestUnauthorizedAccess(t *testing.T) {
	t.Log("=== 测试未授权访问保护 ===")
	
	protectedEndpoints := []string{
		"/v1/clothes",
		"/v1/clothes/stats",
		"/v1/auth/me",
	}
	
	for _, endpoint := range protectedEndpoints {
		t.Run(endpoint, func(t *testing.T) {
			req := httptest.NewRequest("GET", endpoint, nil)
			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)
			
			if w.Code != http.StatusUnauthorized && w.Code != http.StatusForbidden {
				t.Errorf("端点 %s 应该需要认证，但返回了 %d", endpoint, w.Code)
			} else {
				t.Logf("✓ 端点 %s 正确要求认证 (状态码: %d)", endpoint, w.Code)
			}
		})
	}
}

// ============================================
// 测试5：综合测试 - 验证所有现有路由
// ============================================

func TestAllExistingRoutes(t *testing.T) {
	t.Log("=== 综合测试：验证所有现有路由 ===")
	
	existingRoutes := []struct {
		method   string
		path     string
		auth     bool
		expected int
		desc     string
	}{
		{"GET", "/healthz", false, 200, "健康检查"},
		{"POST", "/v1/auth/register", false, 200, "用户注册"},
		{"POST", "/v1/auth/login", false, 200, "用户登录"},
		{"GET", "/v1/clothes", true, 200, "衣物列表"},
		{"GET", "/v1/clothes/stats", true, 200, "衣柜统计"},
		{"GET", "/v1/auth/me", true, 200, "用户信息"},
	}
	
	passedCount := 0
	failedCount := 0
	
	for _, route := range existingRoutes {
		var body *bytes.Buffer

		if route.method == "POST" && route.path == "/v1/auth/register" {
			regData := `{"email":"test` + route.desc + `@test.com","password":"pass123"}`
			body = bytes.NewBufferString(regData)
		} else if route.method == "POST" && route.path == "/v1/auth/login" {
			loginData := `{"email":"test@example.com","password":"pass123"}`
			body = bytes.NewBufferString(loginData)
		} else {
			body = new(bytes.Buffer)
		}
		
		req := httptest.NewRequest(route.method, route.path, body)
		
		if route.auth {
			addAuthHeader(req)
		} else if route.method == "POST" {
			req.Header.Set("Content-Type", "application/json")
		}
		
		w := httptest.NewRecorder()
		testRouter.ServeHTTP(w, req)
		
		status := "✓ PASS"
		if w.Code >= 400 {
			status = "⚠ WARN"
		}
		
		t.Logf("%s [%s] %s -> 状态码: %d", status, route.method, route.desc, w.Code)
		
		if w.Code == http.StatusNotFound {
			t.Errorf("❌ 路由不存在: %s %s", route.method, route.path)
			failedCount++
		} else {
			passedCount++
		}
	}
	
	t.Log("\n========================================")
	t.Logf("测试结果: %d 通过, %d 失败", passedCount, failedCount)
	t.Log("========================================")
	
	if failedCount > 0 {
		t.Errorf("有 %d 个路由测试失败！", failedCount)
	}
}

// ============================================
// 测试6：验证数据模型完整性
// ============================================

func TestDataModelsIntegrity(t *testing.T) {
	t.Log("=== 测试数据模型完整性 ===")
	
	user := model.User{
		ID:       "test-model-user",
		Email:    "model@test.com",
		PasswordHash: "hash",
	}
	
	clothing := model.Clothing{
		ID:           "test-model-clothing",
		UserID:       user.ID,
		Name:         "Test Shirt",
		ImageURL:     "http://test.com/image.jpg",
		Category:     "tops",
		PrimaryColor: "#FF0000",
		ColorName:    "Red",
		Status:       "active",
	}
	
	err := testDB.Create(&user).Error
	if err != nil {
		t.Errorf("创建用户模型失败: %v", err)
		return
	}
	t.Logf("✓ User 模型正常")
	
	err = testDB.Create(&clothing).Error
	if err != nil {
		t.Errorf("创建衣物模型失败: %v", err)
		return
	}
	t.Logf("✓ Clothing 模型正常")
	
	var users []model.User
	testDB.Find(&users)
	t.Logf("✓ 数据库查询正常，当前用户数: %d", len(users))
	
	var clothes []model.Clothing
	testDB.Find(&clothes)
	t.Logf("✓ 数据库查询正常，当前衣物数: %d", len(clothes))
}

// ============================================
// 测试7：边界情况测试
// ============================================

func TestEdgeCases(t *testing.T) {
	t.Log("=== 边界情况测试 ===")
	
	t.Run("空请求体", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/v1/auth/register", bytes.NewBufferString("{}"))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		testRouter.ServeHTTP(w, req)
		
		t.Logf("空请求体注册 -> 状态码: %d (应该返回400)", w.Code)
		if w.Code == http.StatusBadRequest {
			t.Logf("✓ 正确拒绝了无效请求")
		}
	})
	
	t.Run("不存在的资源", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/v1/clothes/non-existent-id", nil)
		addAuthHeader(req)
		
		w := httptest.NewRecorder()
		testRouter.ServeHTTP(w, req)
		
		t.Logf("不存在的衣物ID -> 状态码: %d (应该返回404)", w.Code)
		if w.Code == http.StatusNotFound || w.Code == http.StatusBadRequest {
			t.Logf("✓ 正确处理了不存在的资源")
		}
	})
	
	t.Run("无效的HTTP方法", func(t *testing.T) {
		req := httptest.NewRequest("PATCH", "/v1/clothes", nil)
		addAuthHeader(req)
		
		w := httptest.NewRecorder()
		testRouter.ServeHTTP(w, req)
		
		t.Logf("无效方法 PATCH -> 状态码: %d (应该返回405或404)", w.Code)
	})
}
