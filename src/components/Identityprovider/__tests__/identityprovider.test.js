import {assert} from 'chai';
import sinon from 'sinon';
import {authenticate, identityProviderCallback, getAgencyName} from '../identityprovider.component';
import {createHash} from '../../../utils/hash.utils';
import {mockContext} from '../../../utils/test.util';
import moment from 'moment';
import {md5} from '../../../utils/hash.utils';
import {CONFIG} from '../../../utils/config.util';

describe('test authenticate method', () => {
  const next = () => {
  };
  const ctx = mockContext();

  it('Should return content page', async() => {
    const sandbox = sinon.sandbox.create();
    ctx.setState({serviceClient: {identityProviders: ['borchk', 'unilogin']}});
    ctx.render = sandbox.mock();
    await authenticate(ctx, next);
    assert.equal(ctx.status, 200);
    sandbox.restore();
  });

  it('Should return error', () => {
    ctx.setState({serviceClient: {identityProviders: ['invalid provider']}});
    authenticate(ctx, next);
    assert.equal(ctx.status, 404);
  });
});

describe('test identityProviderCallback method', () => {
  const ctx = mockContext('qwerty', 'some_url', {
    params: {},
    query: {
      id: 'testId'
    }
  });
  ctx.params.token = createHash(ctx.getState().smaugToken);
  const next = () => {
  };

  it('Should add unilogin user to context', async() => {
    ctx.params.type = 'unilogin';
    const user = 'test1234';
    const timestamp = moment().utc().format('YYYYMMDDHHmmss');
    const auth = md5(timestamp + CONFIG.unilogin.secret + user);
    ctx.query = {
      auth: auth,
      timestamp: timestamp,
      user: user
    };

    const expected = {
      userId: 'test1234',
      userType: 'unilogin',
      identityProviders: ['unilogin']
    };
    await identityProviderCallback(ctx, next);

    assert.deepEqual(ctx.getUser(), expected);
  });

  it('Should add nemlogin user to context', async() => {
    ctx.params.type = 'nemlogin';
    const expected = {
      userId: '0102030405',
      userType: 'nemlogin',
      identityProviders: ['nemlogin']
    };
    await identityProviderCallback(ctx, next);
    assert.deepEqual(ctx.getUser(), expected);
  });

  /*  How to set post parameters in test */
  it('Should add borchk user to context', async() => {
    ctx.params.type = 'borchk';
    ctx.fakeBorchkPost = {userId: 'testId', pincode: 'testPincode', libraryId: '710100'};
    const expected = {
      userId: 'testId',
      userType: 'borchk',
      libraryId: '710100',
      pincode: 'testPincode',
      identityProviders: ['borchk'],
      userValidated: true
    };
    await identityProviderCallback(ctx, next);
    assert.deepEqual(ctx.getUser(), expected);
  });

  const agencies = [
    {branchId: '710100', name: 'Hovedbiblioteket, Krystalgade'},
    {branchId: '761500', name: 'Horsens Bibliotek'}
  ];
  it('Should find the library name', async() => {
    assert.equal('Hovedbiblioteket, Krystalgade', getAgencyName('710100', agencies));
  });

  it('Should set unknown library name', async() => {
    assert.equal('Ukendt bibliotek: 710101', getAgencyName('710101', agencies));
  });
});
