//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('/GET auth', () => {
  it('should pass route to sign in if not login', (done) => {
    chai.request(server)
        .get("http://localhost:5000/auth/gitlab")
        .end((err, res) => {
          console.log("res : ",res);
              res.should.have.status(200);
              // res.body.should.be.a('array');
              // res.body.length.should.be.eql(0);
              done();
            });
  });
});