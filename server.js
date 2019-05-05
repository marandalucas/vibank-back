///// IMPORT & INIT EXPRESS FRAMEWORK /////
///////////////////////////////////////////
require('dotenv').config(); //Import dotenv Library to use environment variables
const express = require('express'); // Import express Framework
const app = express(); //Init express


///// SERVER PROPERTIES //////
//////////////////////////////
const port = process.env.PORT || 3000; // Get server Port from env PORT or use default port 3000.
app.listen(port); // This allow start the server listening in port 3000.
console.log("API are listening in port... " + port);


///// ENABLE EXPRESS JSON /////
//////////////////////////////
app.use(express.json()); // Add preprocessor that it provides to get the body as json, if not it arrives as undefined.


///// DEFINE CONTROLLERS /////
//////////////////////////////
const userController = require('./controllers/UserController');
const authController = require('./controllers/AuthController');
const accountController = require('./controllers/AccountController');
const operController = require('./controllers/OperController');


///// CORS OPTIONS TO ENABLED IT /////
//////////////////////////////////////
var enableCORS = function(req, res, next) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");

  // This will be needed.
  res.set("Access-Control-Allow-Headers", "Content-Type");

  next();
 }
app.use(enableCORS); // Enabled to use CORS


///// DEFINE API METHODS/////
/////////////////////////////

// Get users V1
app.get("/vibank/v1/user", userController.getUsersV1);

// Get users by ID V1
app.get("/vibank/v1/user/:id", userController.getUsersByIdV1);

// Post users V1
app.post("/vibank/v1/user", userController.createUserV1);

// Login user V2 with real database
app.post("/vibank/v1/login", authController.loginUserV1);

// Get account opers V1
app.get("/vibank/v1/oper", operController.getOpersV1);

// Get account oper by ID V1
app.get("/vibank/v1/oper/:id", operController.getOpersByIdV1);

// Get account opers by Id Account V1
app.get("/vibank/v1/accountopers/:idaccount", operController.getOpersByIdAccountV1);

// Post opers V1
app.post("/vibank/v1/oper", operController.createOperV1);
