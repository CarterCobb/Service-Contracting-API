# Bring in Node.js
FROM node

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to working directory
COPY package*.json ./

# install dependancies
RUN npm install

# Copy all to container
COPY . .

# Expose port 1000 for the app
EXPOSE 1000

# Run the app
CMD [ "node", "app" ]