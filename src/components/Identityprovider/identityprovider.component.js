/**
 * @file
 *
 */
import {log} from '../../utils/logging.util';
import {createHash, validateHash} from '../../utils/hash.utils';
import {VERSION_PREFIX} from '../../utils/version.util';
import {getUniloginURL, validateUniloginTicket} from '../UniLogin/unilogin.component';
import {validateUserInLibrary, getBorchkResponse} from '../Borchk/borchk.component';
import {getWayfResponse} from '../Wayf/wayf.component';

/**
 * Returns Identityprovider screen if user is not logged in.
 *
 * @param {object} ctx
 * @param {function} next
 * @returns {*}
 */
export async function authenticate(ctx, next) {
  try {
    if (!ctx.hasUser()) {
      const state = ctx.getState();
      const authToken = createHash(state.smaugToken);
      const identityProviders = getIdentityProviders(state.serviceClient.identityProviders, authToken);

      ctx.render('Login', {serviceClient: state.serviceClient.name, identityProviders, VERSION_PREFIX});
      ctx.status = 200;
    }
  }
  catch (e) {
    log.error('Error in autheticate method', {error: e.message, stack: e.stack});
    ctx.status = 404;
  }

  await next();
}

/**
 * Parses the callback parameters for unilogin.
 *
 * @param ctx
 * @returns {*}
 */
export function uniloginCallback(ctx) {
  let userId = null;
  if (validateUniloginTicket(ctx.query)) {
    userId = ctx.query.user;
  }
  else {
    idenityProviderValidationFailed(ctx);
  }

  ctx.setUser({
    userId: userId,
    userType: 'unilogin',
    identityProviders: ['unilogin']
  });

  return ctx;
}

/**
 * Parses the callback parameters for borchk. Parameters from form comes as post
 *
 * @param ctx
 * @returns {*}
 */
export async function borchkCallback(ctx) {
  let validated = false;
  const response = await getBorchkResponse(ctx);
  if (response && response.userId && response.libraryId && response.pincode) {
    validated = await validateUserInLibrary(ctx, response);
  }
  if (validated) {
    ctx.setUser({
      userId: response.userId,
      userType: 'borchk',
      identityProviders: ['borchk'],
      libraryId: response.libraryId,
      pincode: response.pincode,
      userValidated: validated
    });
  }
  else {
    idenityProviderValidationFailed(ctx);
  }

  return ctx;
}

/**
 * Parses the callback parameters for nemlogin.
 *
 * @param ctx
 * @returns {*}
 */
export async function nemloginCallback(ctx) {
  const response = await getWayfResponse(ctx);

  ctx.setUser({
    userId: response.userId,
    userType: 'nemlogin',
    identityProviders: ['nemlogin']
  });

  return ctx;
}

/**
 * Callback function from external identityproviders
 *
 * @param ctx
 * @param next
 */
export async function identityProviderCallback(ctx, next) {
  try {
    if (!validateHash(ctx.params.token, ctx.getState().smaugToken)) {
      ctx.status = 403;
    }
    else {
      switch (ctx.params.type) {
        case 'borchk':
          await borchkCallback(ctx);
          break;
        case 'nemlogin':
          await nemloginCallback(ctx);
          break;
        case 'unilogin':
          uniloginCallback(ctx);
          break;
        default:
          break;
      }
    }
  }
  catch (e) {
    log.error('Error in identityProviderCallback', {error: e.message, stack: e.stack});
    ctx.status = 500;
  }

  await next();
}

/**
 *
 * @param {Array} identityProviders
 * @param {string} authToken
 * @return {{borchk: null}}
 */
function getIdentityProviders(identityProviders, authToken) {
  let providers = {
    borchk: null,
    unilogin: null,
    nemlogin: null
  };

  if (identityProviders.includes('borchk')) {
    providers.borchk = {
      action: `${VERSION_PREFIX}/login/identityProviderCallback/borchk/${authToken}`
    };
  }

  if (identityProviders.includes('unilogin')) {
    providers.unilogin = {
      link: getUniloginURL(authToken)
    };
  }

  if (identityProviders.includes('nemlogin')) {
    providers.nemlogin = {
      link: `${VERSION_PREFIX}/login/identityProviderCallback/nemlogin/${authToken}?eduPersonTargetedID=WAYF-DK-16028a572f83fd83cb0728aab8a6cc0685933a04`
    };
  }

  return providers;
}

function idenityProviderValidationFailed(ctx) {
  const startOver = VERSION_PREFIX + '/login?token=' + ctx.getState().smaugToken + '&returnurl=' + ctx.getState().returnUrl;
  ctx.redirect(startOver);
}
