/*jshint -W030 */

var loopback = require('../');
var lt = require('loopback-testing');
var path = require('path');
var SIMPLE_APP = path.join(__dirname, 'fixtures', 'user-integration-app');
var app = require(path.join(SIMPLE_APP, 'app.js'));
var expect = require('chai').expect;

describe('users - integration', function() {

  lt.beforeEach.withApp(app);

  before(function(done) {
    app.models.myUser.destroyAll(function(err) {
      if (err) return done(err);
      app.models.blog.destroyAll(done);
    });
  });

  after(function(done) {
    app.models.blog.destroyAll(done);
  });

  var userId;
  var accessToken;

  it('should create a new user', function(done) {
    var url = '/api/myUsers';

    this.post(url)
      .send({username: 'x', email: 'x@y.com', password: 'x'})
      .expect(200, function(err, res) {
        if (err) {
          return done(err);
        }
        expect(res.body.id).to.exist;
        userId = res.body.id;
        done();
      });
  });

  it('should log into the user', function(done) {
    var url = '/api/myUsers/login';

    this.post(url)
      .send({username: 'x', email: 'x@y.com', password: 'x'})
      .expect(200, function(err, res) {
        if (err) {
          return done(err);
        }
        expect(res.body.id).to.exist;
        accessToken = res.body.id;
        done();
      });
  });

  it('should create blog for a given user', function(done) {
    var url = '/api/myUsers/' + userId + '/blogs?access_token=' + accessToken;
    this.post(url)
      .send({title: 'T1', content: 'C1'})
      .expect(200, function(err, res) {
        if (err) {
          console.error(err);
          return done(err);
        }
        expect(res.body.title).to.be.eql('T1');
        expect(res.body.content).to.be.eql('C1');
        expect(res.body.userId).to.be.eql(userId);
        done();
      });
  });

  it('should prevent access tokens from being included', function(done) {
    var url = '/api/blogs?filter={"include":{"user":"accessTokens"}}';
    this.get(url)
      .expect(200, function(err, res) {
        if (err) {
          return done(err);
        }
        expect(res.body).to.have.property('length', 1);
        var blog = res.body[0];
        expect(blog.user).to.have.property('username', 'x');
        expect(blog.user).to.not.have.property('accessTokens');
        done();
      });
  });

});
