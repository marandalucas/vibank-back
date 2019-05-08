///// DECLARE CONST /////
/////////////////////////
const requestJson = require('request-json'); // Import request-json Library
const crypt =require("../utils/crypt"); // Import encrypt Library

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const mLabUserCollection = "vibankuser";
const mLabParamsCollection = "vibankparameters";

////// FUNCTIONS //////
///////////////////////

// Get all users V1
function getUsersV1(req, res) {
  console.log("GET /vibank/v1/user");

  var httpClient = requestJson.createClient(baseMLABUrl);
  console.log("Function getUsersV1 - getting vibank users");

  httpClient.get(mLabUserCollection + "?"  + mLabAPIKey,
    function(err, resMlab, body) {
      var response = !err ? body : {
        "msg" : "ERROR getting vibank users"
      }
      res.send(response);
    }
  );
}

// Get User By ID V1
function getUsersByIdV1(req, res) {
  console.log("GET /vibank/v1/user/:id")

  var id = Number.parseInt(req.params.id);
  console.log("Function getUsersByIdV1 - Getting UserID " + id);
  var query = "q=" + JSON.stringify({"id": id});
  console.log("Function getUsersByIdV1 - The query is " + query);

  var httpClient = requestJson.createClient(baseMLABUrl);

  // Control the response status
  httpClient.get(mLabUserCollection + "?"  + query + "&" + mLabAPIKey,
    function(err, resMlab, body) {
      if (err) {
        var response = {
          "msg" : "ERROR getting user"
        }
        console.log("ERROR getting user with id ->" + id);
        res.status(500);
      } else {
        if (body.length > 0) {
          var response = body[0];
          console.log("SUCCESS Found user with id -> " + id);
        } else {
          var response = {
            "msg" : "ERROR User not found"
          }
          console.log("ERROR User not found with id -> " + id);
          res.status(404);
        }
      }
      res.send(response);
    }
  )
}

function createUserV1(req,res) {
  console.log("POST /vibank/v1/user");

  // Get current userID
  var query = "q=" + JSON.stringify({"idparam":"userCount"});
  console.log("Function createUserV1 - The query is -> " + mLabUserCollection + "?" + query);

  var httpClient=requestJson.createClient(baseMLABUrl);
  httpClient.get(mLabParamsCollection + "?" + query + "&" + mLabAPIKey,
  function(err,resMlab, body){
    if(err){
      var response = {
        "msg": "ERROR - getting userCount"
      }
      res.status(500);
    }else {
      if (body.length > 0) {
        // var response = body;

        // Increase userID +1
        userID = body[0].value +1;
  
        // Define newUser body json
        var newUser={
          "id" :userID,
          "first_name" :req.body.first_name,
          "last_name" :req.body.last_name,
          "email" :req.body.email,
          "password" :crypt.hash(req.body.password)
        }
  
        // Print info about new user
        console.log("Creating new user " + newUser.first_name + " with userID " + userID);
  
        // Create User with id, first_name, last_name, email and password
        httpClient.post(mLabUserCollection + "?" +mLabAPIKey,newUser,
        function(errCreateUser,resMlabUser, bodyCreateUser){
          if(errCreateUser){
            var response = {
              "msg": "ERROR creating user"
            }
            res.status(500);
          }else {
            var response = {
              "msg": "SUCCESS created user"
            }
            res.status(201);
            // Updating userID value
            putBody = '{"$set":{"value":' + userID + '}}';
            httpClient.put(mLabParamsCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
            function(errUpParams,resMLabUpParams, bodyUpParams){
              if(errUpParams){
                var response = {
                  "msg": "ERROR updated new userID"
                }
                res.status(500);
              }else {
                var response = {
                  "msg": "SUCESS updated new userID and user Created"
                }
                res.status(201);
              }
            }
            );
            res.send(response);
          }
        }
        );
      } else {
        var response = {
          "msg" : "ERROR: userCount not found"
        }
        res.status(404);
      }
    }
  }
  );


}

////// MODULE EXPORTS ///////
/////////////////////////////

// Get Users V1
module.exports.getUsersV1 = getUsersV1;
module.exports.getUsersByIdV1 = getUsersByIdV1;

// Create User V1
module.exports.createUserV1 = createUserV1;
