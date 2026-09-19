FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /app/server ./cmd/server

FROM gcr.io/distroless/static:nonroot
COPY --from=builder /app/server /server
EXPOSE 8090
ENTRYPOINT ["/server"]
