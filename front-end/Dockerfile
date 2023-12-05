# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory to your Angular project directory
WORKDIR /app/front-end

# Install Angular CLI globally (if not already installed)
RUN npm install -g @angular/cli

# Copy the source code (including your Angular project) into the container
# COPY . .

# Run npm install to install project dependencies
RUN npm install

# Build the Angular app and specify the output directory
# RUN ng build --output-path=/app/dist/front-end
RUN ng build --prod

COPY /dist/front-end /usr/share/nginx/html

# Expose the backend port
EXPOSE 9000

# Define the command to serve your app
CMD ["ng", "serve", "--host", "0.0.0.0"]
