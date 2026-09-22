FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
COPY . .
RUN go mod tidy && go mod download
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

# Runtime con shell para que el healthcheck (wget/curl) funcione.
# distroless no tiene shell y rompe healthcheck -> usar alpine.
FROM alpine:3.20
RUN apk add --no-cache ca-certificates curl wget
COPY --from=builder /app/server /server
EXPOSE 8090
ENTRYPOINT ["/server"]
