# Stage 1: Build the Angular app
FROM node:18 AS builder

WORKDIR /app/front-end

# Install Angular CLI globally (if not already installed)
RUN npm install -g @angular/cli

# Copy the source code (including your Angular project) into the container
COPY . .

# Run npm install to install project dependencies
RUN npm install

# Build the Angular app and specify the output directory
RUN npm run build --prod

# Stage 2: Create a smaller image with only the necessary artifacts
FROM nginx:alpine

# Copy build artifacts from the builder stage
COPY --from=builder /app/front-end/dist/front-end /usr/share/nginx/html

# Expose the backend port
EXPOSE 80

# Define the command to serve your app
CMD ["nginx", "-g", "daemon off;"]

