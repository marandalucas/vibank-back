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
  var sort = "s=" + JSON.stringify({"idOper": -1});
  console.log("Function getOpersByIdAccountV1 - The query is " + query);
  console.log("Function getOpersByIdAccountV1 - The sort is " + sort);

  var httpClient = requestJson.createClient(baseMLABUrl);

  // Control the response status
  httpClient.get(mLabOperCollection + "?"  + query + "&" + sort + "&" + mLabAPIKey,
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
          console.log("SUCCESS Found operations with Id Account -> " + idaccount);
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

  var sign, descTypeOper, IBANOri, IBANDest, saldoFinalDest, saldoFinalOri, idOper, putBody, query;
  var httpClient = requestJson.createClient(baseMLABUrl);

  // Validamos que exista el tipo de operacion
  query = "q=" + JSON.stringify({"idtype": req.body.operType});
  httpClient.get(mLabOperTypeCollection  + "?"  + query + "&" + mLabAPIKey,
  function(err,resMlab, body){
     if(err){
        var response = {"msg": "ERROR operation type"}
        res.status(500);
        res.send(response);
     }else {
        sign = body[0].sign;
        descOperType = body[0].descAbr;

        // Consultamos la información de la cuenta
        query = "q=" + JSON.stringify({"id": req.body.idAccount});
        httpClient.get(mLabAccountCollection  + "?"  + query + "&" + mLabAPIKey,
            function(errAccount, resMlabAccount, bodyAccount) {
                if (body.length > 0){

                   var idAccountOri = Number.parseInt(bodyAccount[0].id);
                   IBANOri = bodyAccount[0].IBAN;
                   query = "q=" + JSON.stringify({"id": idAccountOri});

                   if (sign == "+"){ // tipo de operacion ingreso
                       saldoFinalOri = Number.parseFloat(bodyAccount[0].balance) + Number.parseFloat(req.body.amount);
                   }else if (sign == "-"){
                       saldoFinalOri = Number.parseFloat(bodyAccount[0].balance) - Number.parseFloat(req.body.amount);
                   }

                   // Actualizamos el saldo de la cuenta
                   putBody = '{"$set":{"balance":' + saldoFinalOri + '}}';
                   httpClient.put(mLabAccountCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
                      function(errUpAccount, resMLabUpAccount, bodyUpAccount) {
                         if(errUpAccount){
                            var response = {"msg": "ERROR actualizando saldo"}
                            res.status(500);
                            res.send(response);
                         }else{

                           console.log("Accediendo a parametros");

                           // Obtenemos el valor actual del contador de operaciones
                           query = "q=" + JSON.stringify({"idparam":"operCount"});
                           httpClient.get(mLabParamsCollection  + "?"  + query + "&" + mLabAPIKey,
                               function(errParams,resMlabParams, bodyParams){
                                  if(errParams){
                                      var response = {"msg": "ERROR operation type"}
                                      res.status(500);
                                      res.send(response);
                                  }else {
                                      idOper = Number.parseInt(bodyParams[0].value) + 1;
                                      if (req.body.operType == 1 || req.body.operType == 2){
                                          var newOper={
                                            "idOper" :idOper,
                                            "idAccount" :idAccountOri,
                                            "IBAN" :IBANOri,
                                            "operType" :req.body.operType,
                                            "descOperType":descOperType,
                                            "amount" :req.body.amount,
                                            "sign" :sign,
                                            "balance" :saldoFinalOri
                                          }
                                      }else{
                                          var newOper={
                                            "idOper" :idOper,
                                            "idAccount" :idAccountOri,
                                            "IBAN" :IBANOri,
                                            "operType" :req.body.operType,
                                            "descOperType":descOperType,
                                            "destinationName":req.body.destinationName,
                                            "concept":req.body.concept,
                                            "amount" :req.body.amount,
                                            "sign" :sign,
                                            "balance" :saldoFinalOri
                                          }
                                      }

                                      //Insertamos el nuevo movimiento
                                      httpClient.post(mLabOperCollection + "?" + mLabAPIKey,newOper,
                                      function(errOper,resMlabOper, bodyOper){
                                          if(errOper){
                                             var response = {"msg": "ERROR creating operation"}
                                             res.status(500);
                                             res.send(response);
                                           }else {

                                             // Actualizamos el contador de operaciones
                                             if(req.body.operType == 3 ||req.body.operType == 4){
                                                idOper = idOper + 1; // en caso de transferencia actualizo con 2 movimientos
                                             }

                                             putBody = '{"$set":{"value":' + idOper + '}}';
                                             httpClient.put(mLabParamsCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
                                                function(errUpParams, resMLabUpParams, bodyUpParams) {
                                                   if(errUpParams){
                                                      var response = {"msg": "ERROR actualizando parametros"}
                                                      res.status(500);
                                                      res.send(response);
                                                   }else{
                                                     // En caso de transferencia realizo las acciones de la cuenta destino
                                                     if(req.body.operType == 3 ||req.body.operType == 4){

                                                        query = "q=" + JSON.stringify({"IBAN": req.body.IBANDest});
                                                        httpClient.get(mLabAccountCollection  + "?"  + query + "&" + mLabAPIKey,
                                                            function(errAccountDest, resMlabAccountDest, bodyAccountDest) {
                                                                if (body.length > 0){
                                                                    var idAccountDest = Number.parseInt(bodyAccountDest[0].id);
                                                                    IBANDest = bodyAccountDest[0].IBAN;
                                                                    saldoFinalDest = Number.parseFloat(bodyAccountDest[0].balance) + Number.parseFloat(req.body.amount);
                                                                    sign = "+";

                                                                    query = "q=" + JSON.stringify({"id": idAccountDest});
                                                                    putBody = '{"$set":{"balance":' + saldoFinalDest + '}}';
                                                                    httpClient.put(mLabAccountCollection + "?" + query + "&" + mLabAPIKey, JSON.parse(putBody),
                                                                       function(errUpAccountDest, resMLabUpAccountDest, bodyUpAccountDest) {
                                                                          if(errUpAccountDest){
                                                                             var response = {"msg": "ERROR actualizando saldo cuenta destino"}
                                                                             res.status(500);
                                                                             res.send(response);
                                                                          }else{
                                                                             var newOper={
                                                                                 "idOper" :idOper,
                                                                                 "idAccount" :idAccountDest,
                                                                                 "IBAN" :IBANDest,
                                                                                 "operType" :req.body.operType,
                                                                                 "descOperType":descOperType,
                                                                                 "destinationName":req.body.destinationName,
                                                                                 "concept":req.body.concept,
                                                                                 "amount" :req.body.amount,
                                                                                 "sign" :sign,
                                                                                 "balance" :saldoFinalDest
                                                                              }

                                                                             //Insertamos el nuevo movimiento de la cuenta destino
                                                                             httpClient.post(mLabOperCollection + "?" + mLabAPIKey,newOper,
                                                                             function(errOper,resMlabOper, bodyOper){
                                                                                 if(errOper){
                                                                                    var response = {"msg": "ERROR creating operation"}
                                                                                    res.status(500);
                                                                                    res.send(response);
                                                                                  }else{
                                                                                     var response = {"msg": "SUCCESS created operation"}
                                                                                     res.status(201);
                                                                                     res.send(response);
                                                                                  }
                                                                                }
                                                                              );

                                                                          }
                                                                        }
                                                                     );

                                                                 }else{
                                                                    var response = {"msg" : "Cuenta destino inexistente"}
                                                                    res.status(401);
                                                                    res.send(response);
                                                                 }
                                                               }
                                                             );
                                                           }else{
                                                             var response = {"msg": "SUCCESS created operation"}
                                                             res.status(201);
                                                             res.send(response);
                                                           }

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

// Get account Operations by ID V1
module.exports.getOpersByIdV1 = getOpersByIdV1;

// Get account Operations by Id Account V1
module.exports.getOpersByIdAccountV1 = getOpersByIdAccountV1;

// Post account Operations
module.exports.createOperV1 = createOperV1;
