import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, {
  expect
} from 'chai';
import app from '../../index';

chai.config.includeStack = true;

after((done) => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

/*
 * IMPORTANT: BEFORE TESTING LOGIN ONCE WITH THE SEBIS NG2 USER AND CONNECT TO TRELLO
 * DEFAULT PROVIDER: TRELLO
 */
describe('## TASK API (TRELLO)', () => {
  // USER IS THE SEBIS NG2 TEST USER LOGGED IN VIA GOOGLE OAUTH (EMAIL: sebisng2@gmail.com PASSWORD: s3b1sng2)
  let user = {
    username: 'Sebis NG2',
    password: '104027270624255049375' // Google Profile Id as password when using Google OAUTH strategy
  };

  let boards;
  let lists;
  let cards;
  let createdTask;

  describe('# POST /api/auth/login', () => {
    it('should log in', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: user.password
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.token).to.be.an('string');
          user.token = res.body.token;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/task/boards', () => {
    it('should get all boards for user', (done) => {
      request(app)
        .get(`/api/task/boards`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          boards = res.body;
          lists = boards[0].lists;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/task/boards/:boardId/lists', () => {
    it('should get all lists from a single board', (done) => {
      request(app)
        .get(`/api/task/boards/${boards[0].id}/lists`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/task/lists/:listId/cards', () => {
    it('should get all cards from a single list', (done) => {
      request(app)
        .get(`/api/task/lists/${lists[0].id}/cards`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          cards = res.body;
          done();
        })
        .catch(done);
    });
  });
  /* IMPORTANT: TASKS ARE TREATED AS CARDS IN TRELLO */
  describe('# GET /api/task/:taskId', () => {
    it('should get single card', (done) => {
      request(app)
        .get(`/api/task/${cards[0].id}`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/task', () => {
    it('should create single card', (done) => {
      request(app)
        .post(`/api/task`)
        .set('Authorization', 'JWT ' + user.token)
        .send({
          name: 'testCard',
          idList: lists[0].id
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.equal('testCard');
          createdTask = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/task/:taskId', () => {
    it('should update a single card', (done) => {
      request(app)
        .put(`/api/task/${createdTask.id}`)
        .set('Authorization', 'JWT ' + user.token)
        .send({
          name: 'testNew'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.equal('testNew');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/task/search', () => {
    it('should search for the card', (done) => {
      request(app)
        .get(`/api/task/search?query=testNew&modelTypes=cards`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.cards).to.be.an('array');         
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/task/:taskId', () => {
    it('should delete a single card', (done) => {
      request(app)
        .delete(`/api/task/${createdTask.id}`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          done();
        })
        .catch(done);
    }).timeout(15000);
  });

});
