import { expect } from 'chai';
import sinon from 'sinon';
import { isAdmin } from '../../../routes/adminFunctions/adminFunctions.js';
import { testUsers } from '../../testConfig.js'; // Import user configurations

describe('isAdmin Middleware', () => {
  it('should call next if user is admin', () => {
    const req = {
      user: testUsers.admin, // Ensure testUsers.admin is an object with admin properties
      flash: sinon.spy() // Mock req.flash
    };
    const res = {
      redirect: sinon.spy() // Mock res.redirect
    };
    const next = sinon.spy();

    isAdmin(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.redirect.notCalled).to.be.true; // Ensure res.redirect is not called for admin
  });

  it('should redirect to home if user is not admin', () => {
    const req = {
      user: testUsers.regularUser, // Ensure this user object does not have isAdmin: true
      flash: sinon.spy() // Mock req.flash
    };
    const res = {
      redirect: sinon.spy() // Mock res.redirect
    };
    const next = sinon.spy();

    isAdmin(req, res, next);

    expect(req.flash.calledOnce).to.be.true;
    expect(req.flash.calledWith('error', 'Unauthorized. Please log in as an admin.')).to.be.true;
    expect(res.redirect.calledOnce).to.be.true;
    expect(res.redirect.calledWith('/')).to.be.true; // Ensure redirect to home
    expect(next.notCalled).to.be.true;
  });

  it('should redirect to home if user is not present', () => {
    const req = {
      flash: sinon.spy() // Mock req.flash
    };
    const res = {
      redirect: sinon.spy() // Mock res.redirect
    };
    const next = sinon.spy();

    isAdmin(req, res, next);

    expect(req.flash.calledOnce).to.be.true;
    expect(req.flash.calledWith('error', 'Unauthorized. Please log in as an admin.')).to.be.true;
    expect(res.redirect.calledOnce).to.be.true;
    expect(res.redirect.calledWith('/')).to.be.true; // Ensure redirect to home
    expect(next.notCalled).to.be.true;
  });
});
