
///// DECLARE CONST /////
/////////////////////////
const requestJson = require('request-json'); // Para cargar la librería de request-json
const crypt =require("../utils/crypt"); // Cargamos librería de encriptación

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const mLabAccountCollection = "vibankaccount";

////// FUNCTIONS //////
///////////////////////
function getAccountByIdV1(req, res) {
  console.log("GET /vibank/v1/account/:id")

  var id = Number.parseInt(req.params.id);
  console.log("Function getAccountByIdV1 - The account id is -> " + id);
  var query = "q=" + JSON.stringify({"userID": id});
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

function createAccountV1(req,res) {
  console.log("---------------\nPOST /vibank/v1/account");

  // Generate Random Account
  var randomAccount = "ES32 " + getRandomInt(1,9999) +  " 7701 " + getRandomInt(1,9999) +  " 6520 " + getRandomInt(1,9999);
  console.log(randomAccount);

  var newAccount={
    "IBAN": randomAccount,
    "userID" :req.body.userID,
    "balance" :req.body.balance
  }
  console.log(newAccount);
  var httpClient=requestJson.createClient(baseMLABUrl);

  httpClient.post(mLabAccountCollection + "?" +mLabAPIKey,newAccount,
  function(err,resMlab, body){
    if(err){
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
}

////// MODULE EXPORTS ///////
/////////////////////////////

// Get Account
module.exports.getAccountByIdV1 = getAccountByIdV1;

// Create Account
module.exports.createAccountV1 = createAccountV1;

/////////////////////
///// FUNCTIONS /////
/////////////////////

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}