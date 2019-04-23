const bcrypt = require ('bcrypt');

function hash (data){
  console.log("Hashing data");
  //devuelve String
  return bcrypt.hashSync(data,10);
}

function checkPassword(passwordFromUserInPlainText, passwordFromDBHashed) {
  console.log("Checking password into checkPassword module");

  // Returns boolean
  return bcrypt.compareSync(passwordFromUserInPlainText, passwordFromDBHashed);
}

module.exports.hash = hash;
module.exports.checkPassword = checkPassword;