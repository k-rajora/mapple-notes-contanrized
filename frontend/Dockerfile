
    FROM node:18-alpine as builder


    WORKDIR /app
    
  
    COPY package.json package-lock.json ./
    

    RUN npm ci
   
    COPY . .
    
    RUN npm run build
    
    
    # Stage 2: Serve with Nginx (Production)
   
    FROM nginx:alpine
    
    # Remove default Nginx static assets
    RUN rm -rf /usr/share/nginx/html/*
    
    
    COPY --from=builder /app/dist /usr/share/nginx/html
    
   
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose Port 80
    EXPOSE 80
    
    # running in the foreground cuz if run it in the background it will make the docker container stop
    CMD ["nginx", "-g", "daemon off;"]

