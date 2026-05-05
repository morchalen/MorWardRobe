package config

import (
	"database/sql"
	"fmt"

	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	_ "modernc.org/sqlite"
)

type Config struct {
	App        AppConfig
	Database   DatabaseConfig
	JWT        JWTConfig
	VolcEngine VolcEngineConfig
}

type AppConfig struct {
	Port   string
	Env    string
	Secret string
}

type VolcEngineConfig struct {
	AccessKeyID     string
	SecretAccessKey string
}

type DatabaseConfig struct {
	Type     string
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
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
	viper.SetDefault("JWT_SECRET", "morwardrobe-dev-secret-change-in-production")
	viper.SetDefault("JWT_EXPIRE_HOURS", "24")
	
	viper.SetDefault("DB_TYPE", "sqlite")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "morwardrobe.db")
	viper.SetDefault("DB_SSLMODE", "disable")
	
	viper.SetDefault("VOLCENGINE_ACCESS_KEY_ID", "")
	viper.SetDefault("VOLCENGINE_SECRET_ACCESS_KEY", "")

	viper.ReadInConfig()

	dbType := viper.GetString("DB_TYPE")

	return &Config{
		App: AppConfig{
			Port:   viper.GetString("APP_PORT"),
			Env:    viper.GetString("APP_ENV"),
			Secret: viper.GetString("APP_SECRET"),
		},
		Database: DatabaseConfig{
			Type:     dbType,
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
		VolcEngine: VolcEngineConfig{
			AccessKeyID:     viper.GetString("VOLCENGINE_ACCESS_KEY_ID"),
			SecretAccessKey: viper.GetString("VOLCENGINE_SECRET_ACCESS_KEY"),
		},
	}
}

func (d DatabaseConfig) Connect() *gorm.DB {
	var err error
	var db *gorm.DB
	
	if d.Type == "sqlite" {
		sqlDB, err := sql.Open("sqlite", d.DBName)
		if err != nil {
			panic("failed to open sqlite database: " + err.Error())
		}
		
		db, err = gorm.Open(sqlite.Dialector{Conn: sqlDB}, &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
			SkipDefaultTransaction: true,
		})
	} else {
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			d.Host, d.User, d.Password, d.DBName, d.Port, d.SSLMode)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	}
	
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}

	return db
}
