package handler

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Actor scope of the caller, same rule as the Java services (05-attendance
// CallerScopeResolver): admins see every alert (nil scope); everyone else sees
// the alerts of their own academic actors plus, for instructors, the active
// students of the cohorts they teach. Cached 60 s per user.

const actorScopeKey = "actorScope"

var adminRoles = map[string]bool{"Administrador": true, "Super Administrador": true}

type cachedScope struct {
	actors    map[int64]bool
	expiresAt time.Time
}

var scopeCache sync.Map // userID -> cachedScope

func isAlertPath(path string) bool {
	return strings.HasPrefix(path, "/api/v1/alerts") || strings.HasPrefix(path, "/alerts")
}

func resolveActorScope(ctx context.Context, cfg AuthConfig, userID, token string) (map[int64]bool, error) {
	var roles []struct {
		RoleName string `json:"roleName"`
	}
	if _, err := getJSONStrict(ctx, cfg, cfg.AuthorizationURL+"/api/v1/users/"+url.PathEscape(userID)+"/roles", token, &roles); err != nil {
		return nil, err
	}
	for _, r := range roles {
		if adminRoles[r.RoleName] {
			return nil, nil
		}
	}
	if hit, ok := scopeCache.Load(userID); ok && hit.(cachedScope).expiresAt.After(time.Now()) {
		return hit.(cachedScope).actors, nil
	}

	var user struct {
		PersonID string `json:"personId"`
	}
	if _, err := getJSONStrict(ctx, cfg, cfg.IdentityURL+"/api/v1/users/"+url.PathEscape(userID), token, &user); err != nil {
		return nil, err
	}
	var actors []struct {
		AcademicActorID int64  `json:"academicActorId"`
		PersonID        string `json:"personId"`
	}
	if _, err := getJSONStrict(ctx, cfg, cfg.AcademicURL+"/api/v1/academic-actors?limit=2000", token, &actors); err != nil {
		return nil, err
	}
	scope := map[int64]bool{}
	var own []int64
	for _, a := range actors {
		if user.PersonID != "" && strings.EqualFold(a.PersonID, user.PersonID) {
			scope[a.AcademicActorID] = true
			own = append(own, a.AcademicActorID)
		}
	}
	for _, actorID := range own {
		var blocks []struct {
			CohortID int64 `json:"cohortId"`
		}
		if _, err := getJSONStrict(ctx, cfg, fmt.Sprintf("%s/api/v1/schedule-blocks?instructorActorId=%d", cfg.SchedulingURL, actorID), token, &blocks); err != nil {
			return nil, err
		}
		for _, b := range blocks {
			var enrollments []struct {
				AcademicActorID  int64  `json:"academicActorId"`
				EnrollmentStatus string `json:"enrollmentStatus"`
			}
			if _, err := getJSONStrict(ctx, cfg, fmt.Sprintf("%s/api/v1/cohorts/%d/enrollments", cfg.AcademicURL, b.CohortID), token, &enrollments); err != nil {
				return nil, err
			}
			for _, e := range enrollments {
				if e.EnrollmentStatus == "Active" {
					scope[e.AcademicActorID] = true
				}
			}
		}
	}
	scopeCache.Store(userID, cachedScope{actors: scope, expiresAt: time.Now().Add(time.Minute)})
	return scope, nil
}

// getJSONStrict is getJSON that treats any non-200 answer as an error: a
// partial scope must never widen what the caller can see.
func getJSONStrict(ctx context.Context, cfg AuthConfig, target, token string, out any) (int, error) {
	status, err := getJSON(ctx, cfg.Client, target, token, out)
	if err == nil && status != http.StatusOK {
		err = fmt.Errorf("GET %s answered %d", target, status)
	}
	return status, err
}

// actorAllowed reports whether the request's scope (if any) includes actorID.
func actorAllowed(c *gin.Context, actorID int64) bool {
	value, ok := c.Get(actorScopeKey)
	if !ok || value == nil {
		return true
	}
	scope, _ := value.(map[int64]bool)
	return scope == nil || scope[actorID]
}
