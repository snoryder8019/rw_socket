import { expect } from 'chai';
import sinon from 'sinon';

import { isAdmin } from '../../../routes/adminFunctions/adminFunctions.js';
import { testUsers } from '../../testConfig.js'; // Import user configurations

describe('isAdmin Middleware', () => {
  it('should call next if user is admin', () => {
    const req = {
      user: testUsers.admin // Use admin user from config
    };
    const res = {};
    const next = sinon.spy();

    isAdmin(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it('should redirect to home if user is not admin', () => {
    const req = {
      user: testUsers.regularUser, // Use regular user from config
      flash: sinon.spy()
    };
    const res = {
      redirect: sinon.spy()
    };
    const next = sinon.spy();

    isAdmin(req, res, next);

    expect(req.flash.calledOnce).to.be.true;
    expect(req.flash.calledWith('error', 'Unauthorized. Please log in as an admin.')).to.be.true;
    expect(res.redirect.calledOnce).to.be.true;
    expect(res.redirect.calledWith('/')).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it('should redirect to home if user is not present', () => {
    const req = {
      user: testUsers.noAuthUser, // Represents unauthenticated state
      flash: sinon.spy()
    };
    const res = {
      redirect: sinon.spy()
    };
    const next = sinon.spy();

    isAdmin(req, res, next);

    expect(req.flash.calledOnce).to.be.true;
    expect(req.flash.calledWith('error', 'Unauthorized. Please log in as an admin.')).to.be.true;
    expect(res.redirect.calledOnce).to.be.true;
    expect(res.redirect.calledWith('/')).to.be.true;
    expect(next.notCalled).to.be.true;
  });
});
