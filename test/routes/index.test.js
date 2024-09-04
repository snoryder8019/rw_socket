import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import chalk from 'chalk';
import flash from 'connect-flash';  // Add this line to mock `req.flash`
import cookieParser from 'cookie-parser';
import indexRouter from '../../routes/index.js'; // Adjust path as needed
import { mockCookies } from '../testConfig.js'; // Import mock data

// Create an Express app instance for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/', indexRouter);

describe('Index Router Tests', function () {
  this.timeout(10000);

  before((done) => {
    console.log(chalk.yellow('Starting tests for Index Router...'));
    done();
  });

  it('should render the index page with the correct data', (done) => {
    request(app)
      .get('/')
      .set('Cookie', [mockCookies.adminCookie])
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include('index'); // Adjust based on your index content
        done();
      });
  });

  after(() => {
    console.log(chalk.bgGreen.black('All index router tests completed successfully!'));
  });
});
