/* eslint-disable no-undef */
const assert = require('chai').assert;

import LoginPage from '../pageObjects/loginPage';

describe('Test Smaug tokens', function () {
  this.timeout(30000);
  const loginPage = new LoginPage();

  it('should set state with valid token', function () {
    loginPage.open({token: 'invalid_token', returnurl: 'some_url'});
    browser.include('Forbidden');
  });

  it('should show login with valid token', function () {
    loginPage.open({token: loginPage.validToken, returnurl: 'some_url'});
    browser.include('Log ind');
  });

  it('should set state with valid token', function () {
    loginPage.open({token: loginPage.validToken, returnurl: 'some_url'});
    const session = browser.getSession();
    assert.equal(session.state.smaugToken, loginPage.validToken);
  });
});
