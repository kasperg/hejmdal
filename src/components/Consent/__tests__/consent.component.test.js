/**
 * @file
 * Unittesting methods in consent.component.test
 */

import {assert} from 'chai';
import {
  giveConsentUI,
  retrieveUserConsent,
  getConsent,
  storeUserConsent,
  shouldUserGiveConsent
} from '../consent.component';
import sinon from 'sinon';

import {setDefaultState} from '../../../middlewares/state.middleware';
import {mockContext} from '../../../utils/test.util';
import {ATTRIBUTES} from '../../../utils/attributes.util';

describe('Unittesting methods in consent.component.test', () => {
  let ctx;
  const next = () => {};
  let sandbox;

  beforeEach(() => {
    ctx = mockContext();
    setDefaultState(ctx, next);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('giveConsentUI()', () => {

    it('should redirect if state is unavailable on ctx.session object', () => {
      ctx.redirect = sandbox.stub();

      giveConsentUI(ctx, next);
      assert.isTrue(ctx.redirect.called);
      assert.equal(ctx.redirect.args[0][0], '/fejl');
    });
  });

  describe('shouldUserGiveConsent()', () => {

    beforeEach(() => {
      ctx = mockContext();
      setDefaultState(ctx, next);
      ctx.setUser({userId: 'testUser'});

      ctx.setState({
        serviceClient: {
          id: 'some id',
          attributes: {
            cpr: {}
          }
        },
        ticket: {
          attributes: {
            cpr: '1234'
          }
        }
      });
    });

    it('should give consent if valid attributes and no consent', async() => {
      assert.isTrue(await shouldUserGiveConsent(ctx));
    });

    it('should not give consent if no valid attributes', async() => {
      ctx.setUser({userId: 'testUser'});

      ctx.setState({
        ticket: {
          attributes: {}
        }
      });

      assert.isFalse(await shouldUserGiveConsent(ctx));
    });
  });


  describe('retrieveUserConsent()', () => {

    it('should call next when no user or serviceClient.id is found', async() => {
      const _next = sandbox.stub();

      await retrieveUserConsent(ctx, _next);
      assert.isTrue(_next.called);
    });

    it('should redirect when no consent is found', async() => {
      ctx.redirect = sandbox.stub();
      const serviceClientId = Date.now();
      const userId = 'testuser';

      ctx.setUser({userId: userId});
      ctx.setState({
        serviceClient: {
          id: serviceClientId,
          attributes: {
            cpr: {}
          }
        },
        ticket: {
          attributes: {
            cpr: '1234'
          }
        }

      });

      await retrieveUserConsent(ctx, next);
      assert.isTrue(ctx.redirect.called);
    });

    it('should invoke next when consent is found', async() => {
      ctx.redirect = sandbox.stub();
      const _next = sandbox.stub();
      const serviceClientId = Date.now();
      const userId = 'testuser';

      ctx.setUser({userId: userId});
      ctx.setState({
        serviceClient: {
          id: serviceClientId
        }
      });

      await storeUserConsent(ctx);
      await retrieveUserConsent(ctx, _next);

      assert.isFalse(ctx.redirect.called);
      assert.isTrue(_next.called);
    });

    it('should delete old consent and redirect user to consent page', async() => {
      ctx.redirect = sandbox.stub();
      const serviceClientId = Date.now();
      const userId = 'testUser';

      ctx.setUser({userId: userId});
      ctx.setState({
        serviceClient: {
          id: serviceClientId,
          attributes: ATTRIBUTES
        },
        ticket: {
          attributes: ATTRIBUTES
        }
      });

      // first we store the consent object and verify it has been stored
      await storeUserConsent(ctx);
      const consent = await getConsent(ctx);
      const consent_expected = ['cpr', 'birthDate', 'birthYear', 'gender', 'libraries', 'municipality', 'uniloginId', 'wayfId', 'uniqueId'];
      assert.deepEqual(consent, consent_expected, 'consent was stored as expected');

      // then we create sets a new attributes object and makes a request for the users consent.
      // The check between the old and the consent objekt is implicitly part of the retrival process.
      const newAttrbutes = Object.assign({}, ATTRIBUTES, {newAtt: {name: 'some value'}});
      ctx.setState({
        serviceClient: {
          id: serviceClientId,
          attributes: newAttrbutes
        },
        ticket: {
          attributes: newAttrbutes
        }
      });

      await retrieveUserConsent(ctx, next);

      // ensuring the user is redirected to the consent page
      assert.isTrue(ctx.redirect.called);
      assert.equal(ctx.redirect.args[0], '/login/consent');
    });
  });

  describe('checkForExistingConsent()', () => {

    it('should return false', async() => {
      const consent = await getConsent(ctx);

      assert.deepEqual(consent, []);
    });

    it('should retrieve consent form memory storage', async() => {
      const serviceClientId = Date.now();
      const userId = 'testuser';

      ctx.setUser({userId: userId});
      ctx.setState({
        serviceClient: {
          id: serviceClientId
        }
      });

      await storeUserConsent(ctx);

      const consent = await getConsent(ctx);

      assert.isArray(consent);
      assert.isObject(ctx.session.state.consents[serviceClientId]);
    });
  });
});
