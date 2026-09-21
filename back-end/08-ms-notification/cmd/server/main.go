package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/faceattend/notification-service/internal/infrastructure/config"
)

func main() {
	r := gin.Default()
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok", "service": "notification-service"}) })
	r.GET("/api/v1/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok", "service": "notification-service"}) })

	// Try to connect to Postgres if DATABASE_URL is set
	databaseURL := os.Getenv("DATABASE_URL")
	var pool *pgxpool.Pool
	if databaseURL != "" {
		p, err := pgxpool.New(context.Background(), databaseURL)
		if err != nil {
			log.Printf("WARN: failed to create pool: %v", err)
		} else {
			if err := p.Ping(context.Background()); err != nil {
				log.Printf("WARN: failed to ping DB: %v", err)
			} else {
				pool = p
				defer pool.Close()
				log.Println("connected to postgres")
			}
		}
	} else {
		log.Println("DATABASE_URL not set, running without DB (handlers will return 500 on DB ops)")
	}

	// Wire hexagonal dependencies (even if pool is nil, handlers are registered)
	container := config.Wire(pool)
	if container != nil {
		if container.AlertHandler != nil {
			container.AlertHandler.Register(r)
		}
		if container.AlertTypeHandler != nil {
			container.AlertTypeHandler.Register(r)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}
	log.Printf("notification-service listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to run: %v", err)
	}
}
