package service

import (
	"encoding/json"
	"fmt"
	"net/url"

	"github.com/volcengine/volc-sdk-golang/service/visual"
)

type VolcEngineService struct {
	client *visual.Visual
}

type Config struct {
	AccessKeyID     string
	SecretAccessKey string
}

func NewVolcEngineService(config Config) *VolcEngineService {
	client := visual.NewInstance()
	if config.AccessKeyID != "" && config.SecretAccessKey != "" {
		client.Client.SetAccessKey(config.AccessKeyID)
		client.Client.SetSecretKey(config.SecretAccessKey)
	}

	return &VolcEngineService{
		client: client,
	}
}

// SaliencySegReq 主体分割请求
type SaliencySegReq struct {
	ReqKey           string   `json:"req_key"`
	BinaryDataBase64 []string `json:"binary_data_base64"`
	OnlyMask         int      `json:"only_mask"`
	RefineMask       int      `json:"refine_mask"`
	RGB              []int    `json:"rgb"`
}

// SaliencySegResp 主体分割响应
type SaliencySegResp struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    struct {
		BinaryDataBase64 []string `json:"binary_data_base64"`
	} `json:"data"`
	ResponseMetadata struct {
		Error struct {
			CodeN   int    `json:"CodeN"`
			Code    string `json:"Code"`
			Message string `json:"Message"`
		} `json:"Error"`
	} `json:"ResponseMetadata"`
}

// SegmentImage 调用火山引擎主体分割API
func (s *VolcEngineService) SegmentImage(imageBase64 string) (string, error) {
	reqBody := SaliencySegReq{
		ReqKey:           "saliency_seg",
		BinaryDataBase64: []string{imageBase64},
		OnlyMask:         3,
		RefineMask:       0,
		RGB:              []int{-1, -1, -1},
	}

	reqJSON, _ := json.Marshal(reqBody)

	fmt.Println("[DEBUG] ===== 开始调用火山引擎主体分割API（使用官方SDK）=====")

	query := url.Values{}
	query.Set("Action", "CVProcess")
	query.Set("Version", "2022-08-31")

	bodyBytes, statusCode, err := s.client.Client.Json("CVProcess", query, string(reqJSON))
	if err != nil {
		fmt.Println("[DEBUG] 火山引擎API调用失败:", err.Error())
		return "", fmt.Errorf("failed to call API: %w", err)
	}

	fmt.Println("[DEBUG] 火山引擎API响应状态码:", statusCode)
	fmt.Println("[DEBUG] 火山引擎API响应体:", string(bodyBytes)[:min(2000, len(string(bodyBytes)))])

	var result SaliencySegResp
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	if result.ResponseMetadata.Error.Code != "" {
		return "", fmt.Errorf("API error: code=%s message=%s", result.ResponseMetadata.Error.Code, result.ResponseMetadata.Error.Message)
	}

	if result.Code != 10000 {
		return "", fmt.Errorf("API error: code=%d message=%s", result.Code, result.Message)
	}

	if len(result.Data.BinaryDataBase64) > 0 && result.Data.BinaryDataBase64[0] != "" {
		return result.Data.BinaryDataBase64[0], nil
	}

	return "", fmt.Errorf("no result returned from API")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
