import { expect } from 'chai';
import sinon from 'sinon';
import { isAdmin } from '../../../routes/adminFunctions/adminFunctions.js';

describe('isAdmin Middleware', () => {
  it('should call next if user is admin', () => {
    const req = {
      user: {
        displayName: 'Admin User',
        isAdmin: true
      }
    };
    const res = {};
    const next = sinon.spy();

    isAdmin(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it('should redirect to home if user is not admin', () => {
    const req = {
      user: {
        displayName: 'Regular User',
        isAdmin: false
      },
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
