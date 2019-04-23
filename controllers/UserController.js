///// DECLARE CONST /////
const requestJson = require('request-json'); // Para cargar la librería de request-json
const crypt =require("../utils/crypt"); // Cargamos librería de encriptación

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const mLabUserCollection = "vibankuser?";


////// FUNCTIONS //////

// Get all users
function getUsersV1(req, res) {
  console.log("GET /vibank/v1/user");

  var httpClient = requestJson.createClient(baseMLABUrl);
  console.log("getting users");

  httpClient.get(mLabUserCollection + mLabAPIKey,
    function(err, resMlab, body) {
      var response = !err ? body : {
        "msg" : "ERROR getting users"
      }
      console.log(response);
      res.send(response);
    }
  );
}

// Get User By ID
function getUsersByIdV1(req, res) {
  console.log("GET /vibank/v1/user/:id")

  var id = Number.parseInt(req.params.id);
  console.log("The user id to get is " + id);
  var query = "q=" + JSON.stringify({"id": id});
  console.log("query is " + query);

  var httpClient = requestJson.createClient(baseMLABUrl);
  console.log("Getting user");
  console.log(query);
  // Control the response status
  httpClient.get(mLabUserCollection + query + "&" + mLabAPIKey,
    function(err, resMlab, body) {
      console.log(body);
      if (err) {
        var response = {
          "msg" : "ERROR getting user"
        }
        res.status(500);
      } else {
        if (body.length > 0) {
          var response = body[0];
        } else {
          var response = {
            "msg" : "ERROR User not found"
          }
          res.status(404);
        }
      }
      res.send(response);
    }
  )
}

module.exports.getUsersV1 = getUsersV1;
module.exports.getUsersByIdV1 = getUsersByIdV1;