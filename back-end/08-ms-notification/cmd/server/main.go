package main

import (
    "log"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status":"ok","service":"notification-service"}) })
    r.GET("/api/v1/alerts", func(c *gin.Context) { c.JSON(200, gin.H{"alerts": []}) })
    log.Println("notification-service listening on :8090")
    r.Run(":8090")
}
