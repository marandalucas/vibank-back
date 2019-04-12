# DOCKER NODE IMAGE BASE
FROM node:8.15-jessie-slim

# WORKING DIRECTORY
WORKDIR /project

# COPY PROJECT
ADD . /project

# INSTALL DEPENDENCIES
RUN npm install --only=prod

# Expose node port
EXPOSE 3000

# CMD INIT
CMD ["node", "server.js"]