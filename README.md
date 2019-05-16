# VIBANK-BACK - NodeJS API Project
![Node API](/images/nodeApiLogo.png)

## Description
This project provides a Node API.

## API METHODS

## Init project and Install Express web application framework for Node.js
Express.js, or simply Express, is a web application framework for Node.js, released as free and open-source software under the MIT License. It is designed for building web applications and APIs. It has been called the de facto standard server framework for Node.js

```bash
npm init
npm install express --save
```

## Install Testing Libraries and others
```
npm install nodemon --save-dev
npm install mocha --save-dev
npm install chai --save-dev
npm install chai-http --save-dev
npm install request-json --save
```

## Security Libraries
```
npm install bcrypt --save
```

## Start Node API locally with nodemon
Nodemon restart the service automatically when detect changes in the filesystem

```
npm start
```

## Start Node API locally with node
This option is better than others because give you more info when there are problems.
```
node server.js
```

## Commands to build and run node API with docker in your localhost

### Build Image
```
docker build -t vibank-back .
```

### Run Image
```
docker run -d -p 3000:3000 vibank-back
```
Test your rest api with postman or other tools.

#### Tag and push image to dockerhub
```
docker tag vibank-back yourdockerhubuser/vibank-back
docker push yourdockerhubuser/vibank-back
```

## Example to test SNAPSHOT IMAGE
```
docker run -e MLAB_API_KEY=changeForYouApiKey -d -p 3000:3000 sockmal/vibank-back:1.2.0-SNAPSHOT
```