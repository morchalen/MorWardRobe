package config

import (
	"os"
	"strings"

	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type AppConfig struct {
	Port   string
	Env    string // development|staging|production
	Secret string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string

	InitDB func() *gorm.DB
}

type JWTConfig struct {
	Secret      string
	ExpireHours int
}

func Load() *Config {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()
	viper.SetDefault("APP_PORT", "8080")
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("JWT_SECRET", "smartwardrobe-dev-secret-change-in-production")
	viper.SetDefault("JWT_EXPIRE_HOURS", "24")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "smartwardrobe_dev")
	viper.SetDefault("DB_SSLMODE", "disable")

	viper.ReadInConfig()

	return &Config{
		App: AppConfig{
			Port:   viper.GetString("APP_PORT"),
			Env:    viper.GetString("APP_ENV"),
			Secret: viper.GetString("APP_SECRET"),
		},
		Database: DatabaseConfig{
			Host:     viper.GetString("DB_HOST"),
			Port:     viper.GetString("DB_PORT"),
			User:     viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			DBName:   viper.GetString("DB_NAME"),
			SSLMode:  viper.GetString("DB_SSLMODE"),
		},
		JWT: JWTConfig{
			Secret:      viper.GetString("JWT_SECRET"),
			ExpireHours: viper.GetInt("JWT_EXPIRE_HOURS"),
		},
	}
}

func (d DatabaseConfig) DSN() string {
	return strings.Join([]string{
		"host=" + d.Host,
		"user=" + d.User,
		"password=" + d.Password,
		"dbname=" + d.DBName,
		"port=" + d.Port,
		"sslmode=" + d.SSLMode,
	}, " ")
}

func (d DatabaseConfig) InitDB() *gorm.DB {
	dsn := d.DSN()
	
	var err error
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}

	return db
}
