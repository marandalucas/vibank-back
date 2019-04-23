///// DECLARE CONST /////
/////////////////////////
const requestJson = require('request-json'); // Import request-json Library
const crypt =require("../utils/crypt"); // Import encrypt Library

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const mLabUserCollection = "vibankuser";

////// FUNCTIONS //////
///////////////////////
function loginUserV1(req, res) {
  console.log("POST /vibank/v1/login");

  var query = "q=" + JSON.stringify({"email": req.body.email});
  console.log("Function loginUserV1 - The query is -> " + query);

  httpClient = requestJson.createClient(baseMLABUrl);
  httpClient.get(mLabUserCollection + "?" + query + "&" + mLabAPIKey,
    function(err, resMLab, body) {

      var isPasswordcorrect =
      crypt.checkPassword(req.body.password, body[0].password);
      console.log("Function loginUserV1 - The correct password is -> " + isPasswordcorrect);

      if (!isPasswordcorrect) {
        var response = {
          "msg" : "ERROR Incorrect Login, email or passsword try again..."
        }
        console.log("Function loginUserV1 - ERROR Incorrect Login the password is not correct -> " + isPasswordcorrect);
        res.status(401);
        res.send(response);
      } else {
        console.log("Function loginUserV1 - Got a user with that email and password, logging in");
        var id = Number.parseInt(body[0].id);
        query = "q=" + JSON.stringify({"id": id});
        console.log("Function loginUserV1 - Query for put is " + query);
        var putBody = '{"$set":{"logged":true}}';
        httpClient.put(mLabUserCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
          function(errPUT, resMLabPUT, bodyPUT) {
            console.log("Function loginUserV1 - SUCCESS Loggin Correct insert logged to true");
            var response = {
              "msg" : "SUCCESS User Login",
              "UserID" : body[0].id
            }
            res.send(response);
          }
        )
      }
    }
  );
 }


////// MODULE EXPORTS ///////
/////////////////////////////

// Login User V1
module.exports.loginUserV1 = loginUserV1;
