const jwt = require('jsonwebtoken'); // Import jsonwebtoken Library
// const bodyParser = require('body-parser'); // Import body-parser Library
const jwtToken = process.env.JWT_TOKEN;

function createToken (dataToken){

    console.log("Authenticated");

    var token = jwt.sign(dataToken, jwtToken, {
       expiresIn: 60 * 60 // expires in 1 hour
    })

    return token;
}

module.exports.createToken = createToken;
