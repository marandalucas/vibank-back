const mocha = require('mocha');
const chai = require('chai');
const chaihttp = require('chai-http');

chai.use(chaihttp);

var should = chai.should();

describe("Test that API mlab",
  function() {
    it('Test that API mlab', function(done) {
      chai.request('https://api.mlab.com')
      .get('/')
      .end(
        function(err, res) {
          console.log("Request finished");
          res.should.have.status(403);
          done();
        }
      )
      }
    )
  }
)