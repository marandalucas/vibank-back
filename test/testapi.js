const mocha = require('mocha');
const chai = require('chai');
const chaihttp = require('chai-http');

chai.use(chaihttp);

var should = chai.should();

// Define Base MlabURL
const baseMLABUrl = "https://api.mlab.com/api/1/databases/apitechumal12ed/collections/";
const mLabUserCollection = "vibankuser";
const mLabAccountCollection = "vibankaccount";
const mLabAccountOperationCollection = "vibankoperaccount";
const mLabAPIKey = "apiKey=" + process.env.MLAB_API_KEY;

// False User and Pasword to Testing Login
const userLoginJson = {
  "email" : "marandalucas@gmail.com",
  "password" : "pruebapassword"
};

// Generate random User ID to testing
var userIDTesting = getRandomInt(1,2);


////////////////////////////////
//// Test External Mlab API ////
////////////////////////////////

describe("Test that API mlab",
  function() {
    it('Test that API mlab Users Collections', function(done) {
      chai.request(baseMLABUrl + mLabUserCollection + '?' + mLabAPIKey)
      .get('')
      .end(
        function(err, res) {
          console.log("Request finished");
          res.should.have.status(200);
          done();
        }
      )
      }
    ),
    it('Test that API mlab Accounts Collections', function(done) {
      chai.request(baseMLABUrl + mLabAccountCollection + '?' + mLabAPIKey)
      .get('')
      .end(
        function(err, res) {
          console.log("Request finished");
          res.should.have.status(200);
          done();
        }
      )
      }
    ),
    it('Test that API mlab Accounts Operation Collections', function(done) {
      chai.request(baseMLABUrl + mLabAccountOperationCollection + '?' + mLabAPIKey)
      .get('')
      .end(
        function(err, res) {
          console.log("Request finished");
          res.should.have.status(200);
          done();
        }
      )
      }
    )
  }
)

///////////////////////////////////
//// Test vibank API Endpoints ////
///////////////////////////////////

describe("Test API Vibank ",
  function() {
<<<<<<< HEAD
    // TODO: Actualizar test para funcionan con JWT
    // it('Tests that user api return user by ID', function(done) {
    //   chai.request('http://localhost:3000')
    //   .get('/vibank/v1/user/' + userIDTesting)
    //   .end(
    //     function(err, res) {
    //       console.log("Request finished");

    //       // Check that the response is 200
    //       res.should.have.status(200);
    //       res.body.user = res.body;

    //       // Check that the users object content an array
    //       res.body.user.should.be.a('Object');

    //       // Check that the users object have id, user and password
    //       res.body.user.should.have.property('id');
    //       res.body.user.should.have.property('email');
    //       res.body.user.should.have.property('password');

    //       // Check that the users is correct
    //       res.body.user.id.should.be.eql(userIDTesting);
    //       done();
    //     }
    //   )
    //   }
    // ),
=======
    it('Tests that user api return user by ID', function(done) {
      chai.request('http://localhost:3000')
      .get('/vibank/v1/user/' + userIDTesting)
      .end(
        function(err, res) {
          console.log("Request finished");

          // Check that the response is 200
          res.should.have.status(200);
          res.body.user = res.body;

          // Check that the users object content an array
          res.body.user.should.be.a('Object');

          // Check that the users object have id, user and password
          res.body.user.should.have.property('id');
          res.body.user.should.have.property('email');
          res.body.user.should.have.property('password');

          // Check that the users is correct
          res.body.user.id.should.be.eql(userIDTesting);
          done();
        }
      )
      }
    ),
>>>>>>> 98d2ef927a825e8c7c258a651d893b4219b14f6b
    it('Tests that user api login works', function(done) {
      chai.request('http://localhost:3000')
      .post('/vibank/v1/login')
      .set('content-type', 'application/json')
      .send(userLoginJson)
      .end(
        function(err, res) {
          console.log("Request finished");

          // Check that the response is 401
          res.should.have.status(401);
          res.body.msg.should.be.eql("ERROR Login incorrecto");

          done();
        }
      )
      }
    )
  }
)

/////////////////////
///// FUNCTIONS /////
/////////////////////

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}