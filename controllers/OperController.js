///// DECLARE CONST /////
/////////////////////////
const requestJson = require('request-json'); // Import request-json Library

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const mLabOperCollection = "vibankoperaccount";


////// FUNCTIONS //////
///////////////////////

// Get all operations of account V1
function getOpersV1(req, res) {
  console.log("GET /vibank/v1/oper");

  var httpClient = requestJson.createClient(baseMLABUrl);
  console.log("Function getOpersV1 - getting vibank operations account");

  httpClient.get(mLabOperCollection + "?"  + mLabAPIKey,
    function(err, resMlab, body) {
      var response = !err ? body : {
        "msg" : "ERROR getting vibank operations account"
      }
      res.send(response);
    }
  );
}

// Get Operation By ID V1
function getOpersByIdV1(req, res) {
  console.log("GET /vibank/v1/oper/:id")

  var id = Number.parseInt(req.params.id);
  console.log("Function getOpersByIdV1 - Getting OperID " + id);
  var query = "q=" + JSON.stringify({"idOper": id});
  console.log("Function getOpersByIdV1 - The query is " + query);

  var httpClient = requestJson.createClient(baseMLABUrl);

  // Control the response status
  httpClient.get(mLabOperCollection + "?"  + query + "&" + mLabAPIKey,
    function(err, resMlab, body) {
      if (err) {
        var response = {
          "msg" : "ERROR getting Operation"
        }
        console.log("ERROR getting operation with id ->" + id);
        res.status(500);
      } else {
        if (body.length > 0) {
          var response = body[0];
          console.log("SUCCESS Found user with id -> " + id);
        } else {
          var response = {
            "msg" : "ERROR Operation not found"
          }
          console.log("ERROR Operation not found with id -> " + id);
          res.status(404);
        }
      }
      res.send(response);
    }
  )
}

function createOperV1(req,res) {

  console.log("POST /vibank/v1/oper");

  var newOper={
    "idOper" :req.body.idOper,
    "IBAN" :req.body.IBAN,
    "operType" :req.body.operType,
    "amount" :req.body.amount,
    "sign" :req.body.sign,
    "balance" :req.body.balance,
    "timeStamp" :req.body.timeStamp
  }
  console.log(newOper);
  var httpClient=requestJson.createClient(baseMLABUrl);

  httpClient.post(mLabOperCollection + "?" + mLabAPIKey,newOper,
  function(err,resMlab, body){
    if(err){
      var response = {
        "msg": "ERROR creating operation"
      }
      res.status(500);
    }else {
      var response = {
        "msg": "SUCCESS created operation"
      }
      res.status(201);
    }
    res.send(response);
  }
  );
}

////// MODULE EXPORTS ///////
/////////////////////////////

// Get account Operations V1
module.exports.getOpersV1 = getOpersV1;

// Get account Operations by ID V1
module.exports.getOpersByIdV1 = getOpersByIdV1;

// Post account Operations
module.exports.createOperV1 = createOperV1;
