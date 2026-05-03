package config

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	Nickname     string    `gorm:"type:varchar(100);not null" json:"nickname"`
	AvatarURL    string    `gorm:"type:text" json:"avatar_url"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// UserProfile 用户档案
type UserProfile struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID   uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"user_id"`
	Gender   string    `gorm:"type:varchar(20)" json:"gender"`
	HeightCM float64   `gorm:"type:decimal(5,2)" json:"height_cm"`
	WeightKG float64   `gorm:"type:decimal(5,2)" json:"weight_kg"`
	City     string    `gorm:"type:varchar(100)" json:"city"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// 关联
	User User `gorm:"foreignKey:UserID" json:"-"` // 反向关联不序列化
}

// Clothing 衣物模型
type Clothing struct {
	ID             uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	Name           string     `gorm:"type:varchar(255)" json:"name"`
	Category       string     `gorm:"type:varchar(30);not null" json:"category"` // tops|bottoms|...
	Subcategory    string     `gorm:"type:varchar(50)" json:"subcategory"`
	PrimaryColor   string     `gorm:"type:varchar(7);not null" json:"primary_color"` // HEX
	SecondaryColor string     `gorm:"type:varchar(7)" json:"secondary_color"`
	ColorName      string     `gorm:"type:varchar(50)" json:"color_name"`
	Brand          string     `gorm:"type:varchar(100)" json:"brand"`
	Price          float64    `gorm:"type:decimal(10,2)" json:"price"`
	PurchaseDate   *time.Time `gorm:"type:date" json:"purchase_date"`
	Size           string     `gorm:"type:varchar(20)" json:"size"`
	Seasons        string     `gorm:"type:text;[]" json:"seasons"` // JSON数组存储
	Material       string     `gorm:"type:varchar(200)" json:"material"`
	StyleTags      string     `gorm:"type:text;[]" json:"style_tags"`
	CustomTags     string     `gorm:"type:text;[]" json:"custom_tags"`
	ImageURL       string     `gorm:"type:text;not null" json:"image_url"`
	ThumbnailURL   string     `gorm:"type:text" json:"thumbnail_url"`
	ImageHash      string     `gorm:"type:char(64);uniqueIndex" json:"image_hash"`
	IsFavorite     bool       `gorm:"default:false" json:"is_favorite"`
	FolderID       *uuid.UUID `gorm:"type:uuid" json:"folder_id"`
	Status         string     `gorm:"type:varchar(20);default:active" json:"status"`
	WearCount      int        `gorm:"default:0" json:"wear_count"`
	LastWornDate   *time.Time `gorm:"type:date" json:"last_worn_date"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	// 关联
	Folder *Folder `gorm:"foreignKey:FolderID" json:"-"`
}

// Folder 文件夹模型
type Folder struct {
	ID           uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID       uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	Name         string     `gorm:"type:varchar(100);not null" json:"name"`
	Description  string     `gorm:"type:text" json:"description"`
	ParentFolderID *uuid.UUID `gorm:"type:uuid" json:"parent_folder_id"`
	SortOrder    int        `gorm:"default:0" json:"sort_order"`
	IsSystem     bool       `gorm:"default:false" json:"is_system"`
	SystemType   string     `gorm:"type:varchar(30)" json:"system_type"`
	ClothingCount int       `gorm:"default:0" json:"clothing_count"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`

	// 关联
	ParentFolder *Folder   `gorm:"foreignKey:ParentFolderID" json:"-"`
	Clothings    []Clothing `gorm:"foreignKey:FolderID" json:"-"`
}
