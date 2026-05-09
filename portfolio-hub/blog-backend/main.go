package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

var staticDir = "public"

var (
	dataDir      = "data"
	postsDir     = filepath.Join(dataDir, "posts")
	uploadsDir   = filepath.Join(dataDir, "uploads")
	metadataFile = filepath.Join(dataDir, "metadata.json")
)

type Post struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Slug      string    `json:"slug"`
	Date      time.Time `json:"date"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
	UpdatedAt time.Time `json:"updatedAt,omitempty"`
	Category  string    `json:"category,omitempty"`
	Type      string    `json:"type,omitempty"`
	Excerpt   string    `json:"excerpt"`
	Cover     string    `json:"cover,omitempty"`
	Content   string    `json:"content,omitempty"`
}

type Metadata struct {
	Posts          []Post  `json:"posts"`
	SiteName       string  `json:"siteName,omitempty"`
	Categories     []string `json:"categories,omitempty"`
	Bio            string  `json:"bio,omitempty"`
	SocialLinks    []SocialLink `json:"socialLinks,omitempty"`
	VisitorCount   int     `json:"visitorCount"`
	SetupCompleted bool    `json:"setupCompleted"`
}

type SocialLink struct {
	Platform string `json:"platform"`
	URL      string `json:"url"`
}

func main() {
	port := flag.String("port", "8081", "Server port")
	flag.Parse()

	if err := initDirectories(); err != nil {
		log.Fatal("[错误] 初始化目录失败:", err)
	}

	r := mux.NewRouter()

	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	api := r.PathPrefix("/api").Subrouter()

	api.HandleFunc("/posts", getPosts).Methods("GET")
	api.HandleFunc("/posts", createPost).Methods("POST")
	api.HandleFunc("/posts/{id}", updatePost).Methods("PUT")
	api.HandleFunc("/posts/{id}", deletePost).Methods("DELETE")
	api.HandleFunc("/post/{slug}", getPost).Methods("GET")
	api.HandleFunc("/settings", getSettings).Methods("GET")
	api.HandleFunc("/settings", updateSettings).Methods("PUT")
	api.HandleFunc("/user-info", getUserInfo).Methods("GET")
	api.HandleFunc("/user-profile", updateUserProfile).Methods("PUT")
	api.HandleFunc("/server-status", getServerStatus).Methods("GET")
	api.HandleFunc("/upload", uploadFile).Methods("POST")

	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadsDir))))

	addr := ":" + *port
	fmt.Println("========================================")
	fmt.Println("[DEBUG] 博客后端服务启动")
	fmt.Println("[DEBUG] 服务端口:", *port)
	fmt.Println("[DEBUG] 数据目录:", dataDir)
	fmt.Println("[DEBUG] 帖子目录:", postsDir)
	fmt.Println("[DEBUG] 上传目录:", uploadsDir)
	fmt.Println("[DEBUG] 元数据文件:", metadataFile)
	fmt.Println("========================================")
	log.Fatal(http.ListenAndServe(addr, r))
}

func initDirectories() error {
	dirs := []string{dataDir, postsDir, uploadsDir}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}
	}

	if _, err := os.Stat(metadataFile); os.IsNotExist(err) {
		metadata := Metadata{
			Posts:       []Post{},
			SiteName:    "我的博客",
			Categories:  []string{"技术", "生活", "随笔"},
			SocialLinks: []SocialLink{},
		}
		return saveMetadata(&metadata)
	}
	return nil
}

func loadMetadata() (*Metadata, error) {
	data, err := os.ReadFile(metadataFile)
	if err != nil {
		return nil, err
	}

	var metadata Metadata
	if err := json.Unmarshal(data, &metadata); err != nil {
		return nil, err
	}
	return &metadata, nil
}

func saveMetadata(metadata *Metadata) error {
	data, err := json.MarshalIndent(metadata, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(metadataFile, data, 0644)
}

func slugify(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	var result strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' || r >= 0x4e00 && r <= 0x9fff {
			result.WriteRune(r)
		}
	}
	return result.String()
}

func generateExcerpt(content string, maxLen int) string {
	if len(content) <= maxLen {
		return content
	}
	excerpt := content[:maxLen]
	lastSpace := strings.LastIndex(excerpt, " ")
	if lastSpace > 0 {
		excerpt = excerpt[:lastSpace]
	}
	return excerpt + "..."
}

func getPosts(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 获取帖子列表请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))
	fmt.Println("[DEBUG] 请求路径:", r.URL.Path)
	fmt.Println("[DEBUG] 请求方法:", r.Method)

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	category := r.URL.Query().Get("category")

	fmt.Println("[DEBUG] 查询参数 - page:", pageStr)
	fmt.Println("[DEBUG] 查询参数 - limit:", limitStr)
	fmt.Println("[DEBUG] 查询参数 - category:", category)

	metadata, err := loadMetadata()
	if err != nil {
		fmt.Println("[错误] 加载元数据失败:", err)
		http.Error(w, "加载数据失败", http.StatusInternalServerError)
		return
	}

	posts := metadata.Posts
	fmt.Println("[DEBUG] 总帖子数:", len(posts))

	sort.Slice(posts, func(i, j int) bool {
		return posts[i].Date.After(posts[j].Date)
	})

	page := 1
	limit := 10

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	var filteredPosts []Post
	if category != "" {
		fmt.Println("[DEBUG] 根据分类过滤:", category)
		for _, p := range posts {
			if p.Category == category {
				filteredPosts = append(filteredPosts, p)
			}
		}
	} else {
		filteredPosts = posts
	}

	total := len(filteredPosts)
	offset := (page - 1) * limit
	var paginatedPosts []Post

	fmt.Println("[DEBUG] 当前页码:", page)
	fmt.Println("[DEBUG] 每页数量:", limit)
	fmt.Println("[DEBUG] 偏移量:", offset)
	fmt.Println("[DEBUG] 过滤后总数:", total)

	if offset < total {
		end := offset + limit
		if end > total {
			end = total
		}
		paginatedPosts = filteredPosts[offset:end]
	}

	fmt.Println("[DEBUG] 返回帖子数:", len(paginatedPosts))
	for i, p := range paginatedPosts {
		fmt.Printf("[DEBUG] 帖子 %d: ID=%s, 标题=%s, 分类=%s\n", i+1, p.ID[:8], p.Title, p.Category)
	}

	response := map[string]interface{}{
		"posts":       paginatedPosts,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"totalPages":  (total + limit - 1) / limit,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Println("[DEBUG] 帖子列表请求处理完成")
}

func createPost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 创建帖子请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	var req struct {
		Title    string `json:"title"`
		Category string `json:"category"`
		Cover    string `json:"cover"`
		Content  string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("[错误] 请求体解析失败:", err)
		http.Error(w, "请求体格式错误", http.StatusBadRequest)
		return
	}

	fmt.Println("[DEBUG] 标题:", req.Title)
	fmt.Println("[DEBUG] 分类:", req.Category)
	fmt.Println("[DEBUG] 封面:", req.Cover)
	fmt.Println("[DEBUG] 内容长度:", len(req.Content), "字符")

	if req.Title == "" {
		fmt.Println("[错误] 标题为空")
		http.Error(w, "标题不能为空", http.StatusBadRequest)
		return
	}

	metadata, err := loadMetadata()
	if err != nil {
		fmt.Println("[错误] 加载元数据失败:", err)
		http.Error(w, "加载数据失败", http.StatusInternalServerError)
		return
	}

	id := uuid.New().String()
	slug := slugify(req.Title) + "-" + id[:8]
	now := time.Now()

	post := Post{
		ID:        id,
		Title:     req.Title,
		Slug:      slug,
		Date:      now,
		CreatedAt: now,
		UpdatedAt: now,
		Category:  req.Category,
		Cover:     req.Cover,
		Excerpt:   generateExcerpt(req.Content, 150),
	}

	contentFile := filepath.Join(postsDir, id+".md")
	fmt.Println("[DEBUG] 内容文件路径:", contentFile)
	if err := os.WriteFile(contentFile, []byte(req.Content), 0644); err != nil {
		fmt.Println("[错误] 保存内容失败:", err)
		http.Error(w, "保存内容失败", http.StatusInternalServerError)
		return
	}

	metadata.Posts = append(metadata.Posts, post)
	if err := saveMetadata(metadata); err != nil {
		fmt.Println("[错误] 保存元数据失败:", err)
		http.Error(w, "保存数据失败", http.StatusInternalServerError)
		return
	}

	fmt.Println("[DEBUG] 帖子创建成功, ID:", id[:8])
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "帖子创建成功",
		"post":    post,
	})
}

func updatePost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 更新帖子请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	vars := mux.Vars(r)
	id := vars["id"]
	fmt.Println("[DEBUG] 帖子ID:", id[:8])

	var req struct {
		Title    string `json:"title"`
		Category string `json:"category"`
		Cover    string `json:"cover"`
		Content  string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("[错误] 请求体解析失败:", err)
		http.Error(w, "请求体格式错误", http.StatusBadRequest)
		return
	}

	fmt.Println("[DEBUG] 更新标题:", req.Title)
	fmt.Println("[DEBUG] 更新分类:", req.Category)
	fmt.Println("[DEBUG] 更新封面:", req.Cover)
	fmt.Println("[DEBUG] 更新内容长度:", len(req.Content), "字符")

	metadata, err := loadMetadata()
	if err != nil {
		fmt.Println("[错误] 加载元数据失败:", err)
		http.Error(w, "加载数据失败", http.StatusInternalServerError)
		return
	}

	var postIndex = -1
	for i, p := range metadata.Posts {
		if p.ID == id {
			postIndex = i
			break
		}
	}

	if postIndex == -1 {
		fmt.Println("[错误] 帖子不存在, ID:", id[:8])
		http.Error(w, "帖子不存在", http.StatusNotFound)
		return
	}

	post := &metadata.Posts[postIndex]
	if req.Title != "" {
		fmt.Println("[DEBUG] 更新标题:", post.Title, "->", req.Title)
		post.Title = req.Title
		post.Slug = slugify(req.Title) + "-" + post.ID[:8]
	}
	if req.Category != "" {
		fmt.Println("[DEBUG] 更新分类:", post.Category, "->", req.Category)
		post.Category = req.Category
	}
	if req.Cover != "" {
		fmt.Println("[DEBUG] 更新封面:", post.Cover, "->", req.Cover)
		post.Cover = req.Cover
	}
	post.UpdatedAt = time.Now()

	if req.Content != "" {
		contentFile := filepath.Join(postsDir, id+".md")
		fmt.Println("[DEBUG] 更新内容文件:", contentFile)
		if err := os.WriteFile(contentFile, []byte(req.Content), 0644); err != nil {
			fmt.Println("[错误] 保存内容失败:", err)
			http.Error(w, "保存内容失败", http.StatusInternalServerError)
			return
		}
		post.Excerpt = generateExcerpt(req.Content, 150)
	}

	if err := saveMetadata(metadata); err != nil {
		fmt.Println("[错误] 保存元数据失败:", err)
		http.Error(w, "保存数据失败", http.StatusInternalServerError)
		return
	}

	fmt.Println("[DEBUG] 帖子更新成功, ID:", id[:8])
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "帖子更新成功",
		"post":    post,
	})
}

func deletePost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 删除帖子请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	vars := mux.Vars(r)
	id := vars["id"]
	fmt.Println("[DEBUG] 帖子ID:", id[:8])

	metadata, err := loadMetadata()
	if err != nil {
		fmt.Println("[错误] 加载元数据失败:", err)
		http.Error(w, "加载数据失败", http.StatusInternalServerError)
		return
	}

	var postIndex = -1
	var deletedPost Post
	for i, p := range metadata.Posts {
		if p.ID == id {
			postIndex = i
			deletedPost = p
			break
		}
	}

	if postIndex == -1 {
		fmt.Println("[错误] 帖子不存在, ID:", id[:8])
		http.Error(w, "帖子不存在", http.StatusNotFound)
		return
	}

	fmt.Println("[DEBUG] 删除帖子标题:", deletedPost.Title)
	contentFile := filepath.Join(postsDir, id+".md")
	fmt.Println("[DEBUG] 删除内容文件:", contentFile)
	os.Remove(contentFile)

	metadata.Posts = append(metadata.Posts[:postIndex], metadata.Posts[postIndex+1:]...)

	if err := saveMetadata(metadata); err != nil {
		fmt.Println("[错误] 保存元数据失败:", err)
		http.Error(w, "保存数据失败", http.StatusInternalServerError)
		return
	}

	fmt.Println("[DEBUG] 帖子删除成功, ID:", id[:8])
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "帖子删除成功",
	})
}

func getPost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 获取单篇帖子请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	vars := mux.Vars(r)
	slug := vars["slug"]
	fmt.Println("[DEBUG] 帖子Slug:", slug)

	metadata, err := loadMetadata()
	if err != nil {
		fmt.Println("[错误] 加载元数据失败:", err)
		http.Error(w, "加载数据失败", http.StatusInternalServerError)
		return
	}

	var post *Post
	for _, p := range metadata.Posts {
		if p.Slug == slug {
			post = &p
			break
		}
	}

	if post == nil {
		fmt.Println("[错误] 帖子不存在, Slug:", slug)
		http.Error(w, "帖子不存在", http.StatusNotFound)
		return
	}

	fmt.Println("[DEBUG] 找到帖子, ID:", post.ID[:8])
	fmt.Println("[DEBUG] 帖子标题:", post.Title)

	content, err := os.ReadFile(filepath.Join(postsDir, post.ID+".md"))
	if err != nil {
		fmt.Println("[警告] 读取内容文件失败:", err)
		content = []byte("")
	}

	fmt.Println("[DEBUG] 内容长度:", len(content), "字符")

	extensions := parser.CommonExtensions | parser.AutoHeadingIDs
	p := parser.NewWithExtensions(extensions)
	doc := p.Parse(content)

	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)
	htmlContent := markdown.Render(doc, renderer)

	response := map[string]interface{}{
		"id":        post.ID,
		"title":     post.Title,
		"slug":      post.Slug,
		"date":      post.Date,
		"updatedAt": post.UpdatedAt,
		"excerpt":   post.Excerpt,
		"cover":     post.Cover,
		"content":   string(htmlContent),
		"category":  post.Category,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Println("[DEBUG] 单篇帖子请求处理完成")
}

func getSettings(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 获取设置请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	metadata, err := loadMetadata()
	if err != nil {
		fmt.Println("[错误] 加载元数据失败:", err)
		http.Error(w, "加载数据失败", http.StatusInternalServerError)
		return
	}

	if metadata.SiteName == "" {
		metadata.SiteName = "我的博客"
	}

	if len(metadata.Categories) == 0 {
		metadata.Categories = []string{"技术", "生活", "随笔"}
	}

	fmt.Println("[DEBUG] 站点名称:", metadata.SiteName)
	fmt.Println("[DEBUG] 分类列表:", metadata.Categories)

	response := map[string]interface{}{
		"siteName":    metadata.SiteName,
		"categories":  metadata.Categories,
		"bio":         metadata.Bio,
		"socialLinks": metadata.SocialLinks,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Println("[DEBUG] 设置请求处理完成")
}

func updateSettings(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 更新设置请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	var req struct {
		SiteName    string        `json:"siteName"`
		Categories  []string      `json:"categories"`
		Bio         string        `json:"bio"`
		SocialLinks []SocialLink  `json:"socialLinks"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("[错误] 请求体解析失败:", err)
		http.Error(w, "请求体格式错误", http.StatusBadRequest)
		return
	}

	fmt.Println("[DEBUG] 站点名称:", req.SiteName)
	fmt.Println("[DEBUG] 分类列表:", req.Categories)
	fmt.Println("[DEBUG] 简介长度:", len(req.Bio), "字符")
	fmt.Println("[DEBUG] 社交链接数量:", len(req.SocialLinks))

	metadata, err := loadMetadata()
	if err != nil {
		fmt.Println("[错误] 加载元数据失败:", err)
		http.Error(w, "加载数据失败", http.StatusInternalServerError)
		return
	}

	if req.SiteName != "" {
		fmt.Println("[DEBUG] 更新站点名称:", metadata.SiteName, "->", req.SiteName)
		metadata.SiteName = req.SiteName
	}
	if req.Categories != nil {
		fmt.Println("[DEBUG] 更新分类列表:", req.Categories)
		metadata.Categories = req.Categories
	}
	if req.Bio != "" {
		fmt.Println("[DEBUG] 更新简介")
		metadata.Bio = req.Bio
	}
	if req.SocialLinks != nil {
		fmt.Println("[DEBUG] 更新社交链接")
		metadata.SocialLinks = req.SocialLinks
	}

	if err := saveMetadata(metadata); err != nil {
		fmt.Println("[错误] 保存元数据失败:", err)
		http.Error(w, "保存数据失败", http.StatusInternalServerError)
		return
	}

	fmt.Println("[DEBUG] 设置更新成功")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "设置更新成功",
	})
}

func getUserInfo(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 获取用户信息请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	token := r.Header.Get("Authorization")
	fmt.Println("[DEBUG] Authorization Header 存在:", token != "")
	if token != "" {
		fmt.Println("[DEBUG] Token 长度:", len(token))
	}

	if token == "" {
		fmt.Println("[错误] 未提供认证令牌")
		http.Error(w, "未授权", http.StatusUnauthorized)
		return
	}

	token = strings.TrimPrefix(token, "Bearer ")

	fmt.Println("[DEBUG] 向认证服务请求用户信息")
	client := &http.Client{}
	req, err := http.NewRequest("GET", "http://localhost:8080/auth/me", nil)
	if err != nil {
		fmt.Println("[错误] 创建请求失败:", err)
		http.Error(w, "创建请求失败", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("[错误] 验证用户失败:", err)
		http.Error(w, "验证用户失败", http.StatusUnauthorized)
		return
	}
	defer resp.Body.Close()

	fmt.Println("[DEBUG] 认证服务响应状态:", resp.StatusCode)
	if resp.StatusCode != http.StatusOK {
		fmt.Println("[错误] Token无效")
		http.Error(w, "Token无效", http.StatusUnauthorized)
		return
	}

	var userData map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userData); err != nil {
		fmt.Println("[错误] 解析用户数据失败:", err)
		http.Error(w, "解析用户数据失败", http.StatusInternalServerError)
		return
	}

	fmt.Println("[DEBUG] 用户信息获取成功, Email:", userData["email"])
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userData)
}

func updateUserProfile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 更新用户资料请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	token := r.Header.Get("Authorization")
	fmt.Println("[DEBUG] Authorization Header 存在:", token != "")

	if token == "" {
		fmt.Println("[错误] 未提供认证令牌")
		http.Error(w, "未授权", http.StatusUnauthorized)
		return
	}

	token = strings.TrimPrefix(token, "Bearer ")

	var req struct {
		Username string `json:"username"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("[错误] 请求体解析失败:", err)
		http.Error(w, "请求体格式错误", http.StatusBadRequest)
		return
	}

	fmt.Println("[DEBUG] 更新用户名:", req.Username)

	client := &http.Client{}
	req2, err := http.NewRequest("PUT", "http://localhost:8080/auth/profile", strings.NewReader(`{"username":"`+req.Username+`"}`))
	if err != nil {
		fmt.Println("[错误] 创建请求失败:", err)
		http.Error(w, "创建请求失败", http.StatusInternalServerError)
		return
	}
	req2.Header.Set("Authorization", "Bearer "+token)
	req2.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req2)
	if err != nil {
		fmt.Println("[错误] 更新资料失败:", err)
		http.Error(w, "更新资料失败", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	fmt.Println("[DEBUG] 认证服务响应状态:", resp.StatusCode)
	if resp.StatusCode != http.StatusOK {
		fmt.Println("[错误] 更新资料失败, 状态码:", resp.StatusCode)
		http.Error(w, "更新资料失败", resp.StatusCode)
		return
	}

	fmt.Println("[DEBUG] 用户资料更新成功")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "资料更新成功",
	})
}

func getServerStatus(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 获取服务器状态请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	memUsage := float64(memStats.Alloc) / float64(1024*1024*1024) * 100
	var cpuUsage float64 = float64(runtime.NumGoroutine()) * 10.0

	if cpuUsage > 100 {
		cpuUsage = 50.0 + float64(runtime.NumGoroutine())
	}
	if cpuUsage > 100 {
		cpuUsage = 80.0
	}

	fmt.Println("[DEBUG] CPU使用率:", fmt.Sprintf("%.1f", cpuUsage), "%")
	fmt.Println("[DEBUG] 内存使用率:", fmt.Sprintf("%.1f", memUsage), "%")
	fmt.Println("[DEBUG] Goroutine数量:", runtime.NumGoroutine())
	fmt.Println("[DEBUG] 操作系统:", runtime.GOOS)
	fmt.Println("[DEBUG] 架构:", runtime.GOARCH)

	response := map[string]interface{}{
		"cpu": map[string]interface{}{
			"usage": fmt.Sprintf("%.1f", cpuUsage),
		},
		"memory": map[string]interface{}{
			"usage": fmt.Sprintf("%.1f", memUsage),
		},
		"load": map[string]interface{}{
			"average": fmt.Sprintf("%.1f", cpuUsage),
		},
		"system": map[string]interface{}{
			"os":   runtime.GOOS,
			"arch": runtime.GOARCH,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Println("[DEBUG] 服务器状态请求处理完成")
}

func uploadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("----------------------------------------")
	fmt.Println("[DEBUG] 文件上传请求")
	fmt.Println("[DEBUG] 请求时间:", time.Now().Format(time.RFC3339))

	file, header, err := r.FormFile("file")
	if err != nil {
		fmt.Println("[错误] 读取文件失败:", err)
		http.Error(w, "读取文件失败", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fmt.Println("[DEBUG] 文件名:", header.Filename)
	fmt.Println("[DEBUG] 文件大小:", header.Size, "字节")

	ext := filepath.Ext(header.Filename)
	fmt.Println("[DEBUG] 文件扩展名:", ext)

	filename := uuid.New().String() + ext
	savePath := filepath.Join(uploadsDir, filename)
	fmt.Println("[DEBUG] 保存路径:", savePath)

	dst, err := os.Create(savePath)
	if err != nil {
		fmt.Println("[错误] 创建文件失败:", err)
		http.Error(w, "创建文件失败", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		fmt.Println("[错误] 保存文件失败:", err)
		http.Error(w, "保存文件失败", http.StatusInternalServerError)
		return
	}

	fmt.Println("[DEBUG] 文件上传成功")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "文件上传成功",
		"url":    "/uploads/" + filename,
	})
}