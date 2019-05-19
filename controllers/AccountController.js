
///// DECLARE CONST /////
/////////////////////////
const requestJson = require('request-json'); // Para cargar la librería de request-json
const jwt = require('jsonwebtoken'); // Import jsonwebtoken Library

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const mLabAccountCollection = "vibankaccount";
const mLabParamsCollection = "vibankparameters";

////// FUNCTIONS //////
///////////////////////
function getAccountsByIdUserV1(req, res) {

  console.log("GET /vibank/v1/accounts/:id")

  if(!req.headers['authorization']) {

      var response = {
        "msg" : "Petición sin cabecera"
      }
      res.status(401);
      res.send(response);

  }else{

    var token = req.headers['authorization'];
    console.log("el token es:" + token);
    token = token.replace('Bearer ', '')

    jwt.verify(token, 'Secret Password', function(err, token) {
      if (err) {
          var response = {
            "msg" : "Token invalido"
          }
          res.status(401);
          res.send(response);
      } else {

          var idUser = Number.parseInt(req.params.id);
          console.log("Function getAccountsByIdUserV1 - The account idUser is -> " + idUser);
          var query = "q=" + JSON.stringify({"idUser": idUser});
          console.log("Function getAccountsByIdUserV1 - The query is -> " + mLabAccountCollection + "?" + query);

          var httpClient = requestJson.createClient(baseMLABUrl);
          // Control the response status
          httpClient.get(mLabAccountCollection + "?" + query + "&" + mLabAPIKey,
            function(err, resMlab, body) {
              if (err) {
                var response = {
                  "msg" : "ERROR - getting account"
                }
                res.status(500);
              } else {
                if (body.length > 0) {
                  var response = body;
                } else {
                  var response = {
                    "msg" : "ERROR: account not found"
                  }
                  res.status(404);
                }
              }
              res.send(response);
            }
          )
      }
    })
  }
}

function getAccountByIdV1(req, res) {
  console.log("GET /vibank/v1/account/:idaccount")
  console.log()
  var idAccount = Number.parseInt(req.params.idaccount);
  console.log("Function getAccountByIdV1 - The account id is -> " + idAccount);
  var query = "q=" + JSON.stringify({"idAccount": idAccount});
  console.log("Function getAccountByIdV1 - The query is -> " + mLabAccountCollection + "?" + query);

  var httpClient = requestJson.createClient(baseMLABUrl);
  console.log(query);
  // Control the response status
  httpClient.get(mLabAccountCollection + "?" + query + "&" + mLabAPIKey,
    function(err, resMlab, body) {
      if (err) {
        var response = {
          "msg" : "ERROR - getting account"
        }
        res.status(500);
      } else {
        if (body.length > 0) {
          var response = body[0];
          console.log("Mi respuesta" + response);
        } else {
          var response = {
            "msg" : "ERROR: account not found"
          }
          res.status(404);
        }
      }
      res.send(response);
    }
  )
}

function createAccountV1(req,res) {
  console.log("---------------\nPOST /vibank/v1/account");

  // Generate Random Account
  var randomAccount = "ES32 " + getRandomInt(1,9999) +  " 7701 " + getRandomInt(1,9999) +  " 6520 " + getRandomInt(1,9999);
  console.log(randomAccount);

  // Get current accountID
  var query = "q=" + JSON.stringify({"idparam":"accountCount"});
  console.log("Function createAccountV1 - The query is -> " + mLabAccountCollection + "?" + query);

  var httpClient=requestJson.createClient(baseMLABUrl);
  httpClient.get(mLabParamsCollection + "?" + query + "&" + mLabAPIKey,
    function(err, resMlab, body) {
      if (err) {
        var response = {
          "msg" : "ERROR - getting accountCount"
        }
        res.status(500);
      } else {
        if (body.length > 0) {
          var response = body;
        } else {
          var response = {
            "msg" : "ERROR: accountCount not found"
          }
          res.status(404);
        }
      }

      // Increase acccountID +1
      var idAccount = body[0].value +1;

      // Define newAccount body json
      var newAccount={
        "IBAN": randomAccount,
        "idAccount": idAccount,
        "idUser" :req.body.idUser,
        "balance" :req.body.balance
      }
      // Updating accoudID value
      putBody = '{"$set":{"value":' + idAccount + '}}';
      httpClient.put(mLabParamsCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
      function(errUpParams,resMLabUpParams, bodyUpParams){
        if(errUpParams){
          var response = {
            "msg": "ERROR created new accountID"
          }
          res.status(500);
        }else {
          // Create Account with userID, last accountID+1 and balance
          httpClient.post(mLabAccountCollection + "?" + mLabAPIKey,newAccount,
          function(errCreateAccount,resMlabAccount, bodyCreateAccount){
            if(errCreateAccount){
              var response = {
                "msg": "ERROR creating account"
              }
              res.status(500);
            }else {
              var response = {
                "msg": "SUCCESS created account"
              }
              res.status(201);
            }
            res.send(response);
          }
          );

          res.status(201);
        }
      }
      );
    }
  );
}

////// MODULE EXPORTS ///////
/////////////////////////////

// Get Account
module.exports.getAccountByIdV1 = getAccountByIdV1;

// Get Accounts
module.exports.getAccountsByIdUserV1 = getAccountsByIdUserV1;

// Create Account
module.exports.createAccountV1 = createAccountV1;

/////////////////////
///// FUNCTIONS /////
/////////////////////

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
