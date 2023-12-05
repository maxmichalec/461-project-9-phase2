# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory to your Angular project directory
WORKDIR /app/front-end

# Install Angular CLI globally (if not already installed)
RUN npm install -g @angular/cli

# Copy the source code (including your Angular project) into the container
COPY . .

RUN npm install
RUN npm run build --prod

# Stage 2: Create a smaller image with only the necessary artifacts
FROM nginx:alpine

COPY --from=builder /app/front-end/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
