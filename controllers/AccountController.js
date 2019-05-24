
///// DECLARE CONST /////
/////////////////////////
const requestJson = require('request-json'); // Para cargar la librería de request-json
const jwt = require('jsonwebtoken'); // Import jsonwebtoken Library

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const jwtToken = process.env.JWT_TOKEN;
const mLabAccountCollection = "vibankaccount";
const mLabParamsCollection = "vibankparameters";

////// FUNCTIONS //////
///////////////////////

// Obtencion cuentas de un usuario
function getAccountsByIdUserV1(req, res) {

  console.log("GET /vibank/v1/accounts/:idUser")

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
    jwt.verify(token, jwtToken, function(err, token) {
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
                  "msg" : "ERROR - Obteniendo cuenta"
                }
                res.status(500);
              } else {
                if (body.length > 0) {
                  var response = body;
                } else {
                  var response = {
                    "msg" : "ERROR: Cuenta no existente"
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

// consulta de cuenta por id
function getAccountByIdV1(req, res) {

  console.log("GET /vibank/v1/account/:idaccount")

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
      jwt.verify(token, jwtToken, function(err, token) {
        if (err) {
            var response = {
              "msg" : "Token invalido"
            }
            res.status(401);
            res.send(response);
        } else {

          // consulta de la cuenta
            console.log("GET /vibank/v1/account/:idaccount")
            var idAccount = Number.parseInt(req.params.idaccount);
            console.log("Function getAccountByIdV1 - The account id is -> " + idAccount);
            var query = "q=" + JSON.stringify({"idAccount": idAccount});
            console.log("Function getAccountByIdV1 - The query is -> " + mLabAccountCollection + "?" + query);

            var httpClient = requestJson.createClient(baseMLABUrl);
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


// Creacion de nueva cuenta
function createAccountV1(req,res) {

  console.log("POST /vibank/v1/account");

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
      jwt.verify(token, jwtToken, function(err, token) {
        if (err) {
            var response = {
              "msg" : "Token invalido"
            }
            res.status(401);
            res.send(response);
        } else {

            // generacion iban mediante random
            var randomAccount = "ES32 " + getRandomInt(1,9999) +  " 7701 " + getRandomInt(1,9999) +  " 6520 " + getRandomInt(1,9999);
            console.log(randomAccount);

            // consulta parametros generales - contador cuentas
            var query = "q=" + JSON.stringify({"idparam":"accountCount"});
            console.log("Function createAccountV1 - The query is -> " + mLabAccountCollection + "?" + query);

            var httpClient=requestJson.createClient(baseMLABUrl);
            httpClient.get(mLabParamsCollection + "?" + query + "&" + mLabAPIKey,
              function(err, resMlab, body) {
                if (err) {
                    var response = {
                      "msg" : "ERROR - Obteniendo contador de cuentas"
                    }
                    res.status(500);
                } else {
                    if (body.length > 0) {
                      var response = body;
                    } else {
                      var response = {
                        "msg" : "ERROR: contador de cuentas no existente"
                      }
                      res.status(404);
                      res.send(response);
                    }
                }

                // incremento contador de cuentas
                var idAccount = body[0].value +1;

                var newAccount={
                  "IBAN": randomAccount,
                  "idAccount": idAccount,
                  "idUser" :req.body.idUser,
                  "balance" :req.body.balance
                }
                // actualizacion parametros generales - contador cuentas
                putBody = '{"$set":{"value":' + idAccount + '}}';
                httpClient.put(mLabParamsCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
                function(errUpParams,resMLabUpParams, bodyUpParams){
                  if(errUpParams){
                    var response = {
                      "msg": "ERROR creando nuevo identificador de cuenta"
                    }
                    res.status(500);
                    res.send(response);
                  }else {
                    // creacion de nueva cuenta
                    httpClient.post(mLabAccountCollection + "?" + mLabAPIKey,newAccount,
                    function(errCreateAccount,resMlabAccount, bodyCreateAccount){
                      if(errCreateAccount){
                        var response = {
                          "msg": "ERROR creando cuenta"
                        }
                        res.status(500);
                        res.send(response);
                      }else {
                        var response = {
                          "msg": "Cuenta creada",
                          "IBAN": randomAccount
                        }
                        res.status(201);
                        res.send(response);
                      }
                    }
                    )
                  }
                }
                )
              }
            )

          }
        })
      }

}

////// MODULE EXPORTS ///////
/////////////////////////////

// Consulta cuenta por id
module.exports.getAccountByIdV1 = getAccountByIdV1;

// Consulta cuentas de un usuario
module.exports.getAccountsByIdUserV1 = getAccountsByIdUserV1;

// Creacion nueva cuenta
module.exports.createAccountV1 = createAccountV1;

/////////////////////
///// FUNCTIONS /////
/////////////////////

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
