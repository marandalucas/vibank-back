///// DECLARE CONST /////
/////////////////////////
const requestJson = require('request-json'); // Import request-json Library
const crypt = require("../utils/crypt"); // Import encrypt Library
const authentic = require("../utils/authentic"); // Import autentication Library
const jwt = require('jsonwebtoken'); // Import jsonwebtoken Library

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const mLabUserCollection = "vibankuser";

////// FUNCTIONS //////
///////////////////////

// Login de usuario
function loginUserV1(req, res) {

  console.log("POST /vibank/v1/login");

  // consulta de usuario mediante email
  var query = "q=" + JSON.stringify({"email": req.body.email});
  console.log("Function loginUserV1 - The query is -> " + query);

  httpClient = requestJson.createClient(baseMLABUrl);
  httpClient.get(mLabUserCollection + "?" + query + "&" + mLabAPIKey,
    function(err, resMLab, body) {

      // validacion de password
      var isPasswordcorrect =
      crypt.checkPassword(req.body.password, body[0].password);
      console.log("Function loginUserV1 - The correct password is -> " + isPasswordcorrect);

      if (!isPasswordcorrect) {
        var response = {
          "msg" : "ERROR Login incorrecto"
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

        // actualizacion login usuario
        httpClient.put(mLabUserCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
          function(errPUT, resMLabPUT, bodyPUT) {

            console.log("Function loginUserV1 - SUCCESS Loggin Correct insert logged to true");

            var tokenData = {
                email: req.body.email
            }

            // generacion de token de sesion
            var token = authentic.createToken(tokenData);

            var response = {
              "msg" : "Login realizado",
              "token": token,
              "UserID" : body[0].id
            }
            res.send(response);
          }
        )
      }
    }
  );
 }

 // Logout de usuario
 function logoutUserV1(req, res) {

  console.log("POST /vibank/v1/logout/:id");

  // validacion de existencia de cabecera
  if(!req.headers['authorization']) {

      var response = {
        "msg" : "Petición sin cabecera"
      }
      res.status(401);
      res.send(response);

  }else{

    var token = req.headers['authorization'];
    token = token.replace('Bearer ', '')

    // validacion de usuario autorizado mediante token
    jwt.verify(token, 'Secret Password', function(err, token) {
      if (err) {
          var response = {
            "msg" : "Token invalido"
          }
          res.status(401);
          res.send(response);
          console("estoy aqui");
      } else {

          var id = Number.parseInt(req.params.id);
          var query = "q=" + JSON.stringify({"id": id});
          console.log("Function logoutUserV1 - The query is -> " + query);

          httpClient = requestJson.createClient(baseMLABUrl);
          httpClient.get(mLabUserCollection + "?" + query + "&" + mLabAPIKey,
            function(err, resMLab, body) {
              if (body.length == 0) {
                var response = {
                  "msg" : "ERROR - Logout incorrecto, el  usuario no existe"
                }
                res.status(404);
                res.send(response);
              } else {

                console.log("Function logoutUserV1 - Got a user with that id, logging out");
                id = Number.parseInt(body[0].id);
                query = "q=" + JSON.stringify({"id": id});

                console.log("Function logoutUserV1 - Query for put is " + query);
                var putBody = '{"$unset":{"logged":""}}'

                // actualizacion logout usuario
                httpClient.put(mLabUserCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
                  function(errPUT, resMLabPUT, bodyPUT) {
                    console.log("Function logoutUserV1 - PUT done");
                    var response = {
                      "msg" : "Logout realizado",
                      "userID" : body[0].id
                    }
                    res.send(response);
                  }
                )
              }
            }
          )

        }
      })
    }

 }


////// MODULE EXPORTS ///////
/////////////////////////////

// Login User V1
module.exports.loginUserV1 = loginUserV1;

// Logout User V1
module.exports.logoutUserV1 = logoutUserV1;
