# ============================================================
#  FaceAttend EDU — Frontend Web (Expo Web estático + nginx)
#  Build: expo export --platform web → dist/ → nginx :80
#  Backend: EXPO_PUBLIC_API_URL (default http://kong-gateway:8000
#  en compose; en local http://localhost:8080)
# ============================================================
FROM node:20-alpine AS build
WORKDIR /app
ARG EXPO_PUBLIC_API_URL=http://localhost:8080
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . ./
RUN npx expo export --platform web

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=20s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1
