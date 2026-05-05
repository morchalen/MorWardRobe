package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID               string    `gorm:"size:36;primaryKey" json:"id"`
	Email            string    `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash     string    `gorm:"size:255;not null" json:"-"`
	AvatarURL        string    `gorm:"type:text" json:"avatar_url"`
	BodyImageURL     string    `gorm:"type:text" json:"body_image_url"`
	Role             string    `gorm:"size:20;default:user;index" json:"role"`
	IsActive         bool      `gorm:"default:true" json:"is_active"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	if u.Role == "" {
		u.Role = "user"
	}
	return nil
}

type Clothing struct {
	ID            string    `gorm:"size:36;primaryKey" json:"id"`
	UserID        string    `gorm:"size:36;not null;index" json:"user_id"`
	Name          string    `gorm:"size:255" json:"name"`
	ImageURL      string    `gorm:"type:text;not null" json:"image_url"`
	ThumbnailURL  string    `gorm:"type:text" json:"thumbnail_url"`
	Category      string    `gorm:"size:30;not null" json:"category"`
	Color         string    `gorm:"size:50;not null" json:"color"`
	SeasonsRaw    string    `gorm:"type:text;column:seasons" json:"-"`
	WardrobeType  string    `gorm:"size:10;default:thin" json:"wardrobe_type"`
	Status        string    `gorm:"size:20;default:active" json:"status"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Seasons []string `gorm:"-" json:"seasons"`
}

func (c *Clothing) AfterFind(tx *gorm.DB) error {
	if c.SeasonsRaw != "" {
		json.Unmarshal([]byte(c.SeasonsRaw), &c.Seasons)
	}
	return nil
}

func (c *Clothing) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	if c.SeasonsRaw == "" && len(c.Seasons) > 0 {
		seasonsJSON, _ := json.Marshal(c.Seasons)
		c.SeasonsRaw = string(seasonsJSON)
	}
	if c.ThumbnailURL == "" {
		c.ThumbnailURL = c.ImageURL
	}
	return nil
}

func (c *Clothing) BeforeUpdate(tx *gorm.DB) error {
	if len(c.Seasons) > 0 {
		seasonsJSON, _ := json.Marshal(c.Seasons)
		c.SeasonsRaw = string(seasonsJSON)
	}
	return nil
}
