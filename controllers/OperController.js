///// DECLARE CONST /////
/////////////////////////
const requestJson = require('request-json'); // Import request-json Library

const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;
const mLabOperCollection = "vibankoperaccount";
const mLabAccountCollection = "vibankaccount";
const mLabOperTypeCollection = "vibankopertype";
const mLabParamsCollection = "vibankparameters";

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
          console.log("SUCCESS Found oper with id -> " + id);
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

// Get Operation By Id Account V1
function getOpersByIdAccountV1(req, res) {
  console.log("GET /vibank/v1/accountopers/:idaccount")

  var idaccount = Number.parseInt(req.params.idaccount);
  console.log("Function getOpersByIdAccountV1 - Getting Oper Id Account " + idaccount);
  var query = "q=" + JSON.stringify({"idAccount": idaccount});
  console.log("Function getOpersByIdAccountV1 - The query is " + query);

  var httpClient = requestJson.createClient(baseMLABUrl);

  // Control the response status
  httpClient.get(mLabOperCollection + "?"  + query + "&" + mLabAPIKey,
    function(err, resMlab, body) {
      if (err) {
        var response = {
          "msg" : "ERROR getting Operation"
        }
        console.log("ERROR getting operation with Id Account ->" + idaccount);
        res.status(500);
      } else {
        if (body.length > 0) {
          var response = body;
          console.log("SUCCESS Found user with Id Account -> " + idaccount);
                    console.log(response);
        } else {
          var response = {
            "msg" : "ERROR Operation not found"
          }
          console.log("ERROR Operation not found with Id Account -> " + idaccount);
          res.status(404);
        }
      }
      res.send(response);
    }
  )
}

function createOperV1(req,res) {

  console.log("POST /vibank/v1/oper");
  var httpClient = requestJson.createClient(baseMLABUrl);

  // Se valida el tipo de operacion
  var sign, descTypeOper, IBAN, saldoFinal, idOper;

  var query = "q=" + JSON.stringify({"idtype": req.body.operType});
  httpClient.get(mLabOperTypeCollection  + "?"  + query + "&" + mLabAPIKey,
  function(err,resMlab, body){
     if(err){
        var response = {"msg": "ERROR operation type"}
        res.status(500);
        res.send(response);
     }else {
        sign = body[0].sign;
        descOperType = body[0].descAbr;

        var query = "q=" + JSON.stringify({"id": req.body.idAccount});
        httpClient.get(mLabAccountCollection  + "?"  + query + "&" + mLabAPIKey,
            function(errAccount, resMlabAccount, bodyAccount) {
                if (body.length > 0){

                   var id = Number.parseInt(bodyAccount[0].id);
                   IBAN = body[0].IBAN;
                   query = "q=" + JSON.stringify({"id": id});

                   console.log("Saldo inicial: " + saldoFinal);

                   if (sign == "+"){ // tipo de operacion ingreso
                       saldoFinal = bodyAccount[0].balance + req.body.amount;
                   }else if (sign == "-"){
                       saldoFinal = bodyAccount[0].balance - req.body.amount;
                   }

                   console.log("Actualizo el saldo a " + saldoFinal);
                   var putBody = '{"$set":{"balance":' + saldoFinal + '}}';

                   httpClient.put(mLabAccountCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
                      function(errUpAccount, resMLabUpAccount, bodyUpAccount) {
                         if(errUpAccount){
                            var response = {"msg": "ERROR actualizando saldo"}
                            res.status(500);
                            res.send(response);
                         }else{

                           console.log("Accediendo a parametros");

                           var httpClient = requestJson.createClient(baseMLABUrl);

                           var query = "q=" + JSON.stringify({"idparam":"operCount"});
                           httpClient.get(mLabParamsCollection  + "?"  + query + "&" + mLabAPIKey,
                               function(errParams,resMlabParams, bodyParams){
                                  if(errParams){
                                      var response = {"msg": "ERROR operation type"}
                                      res.status(500);
                                      res.send(response);
                                  }else {
                                      idOper = Number.parseInt(bodyParams[0].value) + 1;
                                      var newOper={
                                        "idOper" :idOper,
                                        "idAccount" :req.body.idAccount,
                                        "IBAN" :req.body.IBAN,
                                        "operType" :req.body.operType,
                                        "descOperType":descOperType,
                                        "amount" :req.body.amount,
                                        "sign" :sign,
                                        "balance" :saldoFinal
                                      }

                                      console.log(newOper);

                                      var httpClient=requestJson.createClient(baseMLABUrl);

                                      httpClient.post(mLabOperCollection + "?" + mLabAPIKey,newOper,
                                      function(errOper,resMlabOper, bodyOper){
                                          if(errOper){
                                             var response = {"msg": "ERROR creating operation"}
                                             res.status(500);
                                             res.send(response);
                                           }else {

                                             var putBody = '{"$set":{"value":' + idOper + '}}';
                                             httpClient.put(mLabParamsCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
                                                function(errUpParams, resMLabUpParams, bodyUpParams) {
                                                   if(errUpParams){
                                                      var response = {"msg": "ERROR actualizando parametros"}
                                                      res.status(500);
                                                      res.send(response);
                                                   }else{
                                                      var response = {"msg": "SUCCESS created operation"}
                                                      res.status(201);
                                                      res.send(response);
                                                   }
                                                }
                                              );
                                            }}
                                     );
                                  }
                                }
                            );
                         }
                      }
                   );
                }else{
                   var response = {"msg" : "Cuenta inexistente"}
                   res.status(401);
                   res.send(response);
                }
            }
        );
     }
   }
  );

}

////// MODULE EXPORTS ///////
/////////////////////////////

// Get account Operations V1
module.exports.getOpersV1 = getOpersV1;

// Get account Operations by ID V1
module.exports.getOpersByIdV1 = getOpersByIdV1;

// Get account Operations by Id Account V1
module.exports.getOpersByIdAccountV1 = getOpersByIdAccountV1;

// Post account Operations
module.exports.createOperV1 = createOperV1;
