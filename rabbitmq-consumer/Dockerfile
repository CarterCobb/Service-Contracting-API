# Bring in Node.js
FROM node

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to working directory
COPY package*.json .

# Update Node Package Manager to the latest version
RUN npm install -g npm@7.5.4

# install dependancies
RUN npm install

# Copy all to container
COPY . .

# Expose port 1002 for the app
EXPOSE 1002

# Run the app
CMD [ "node", "app" ]