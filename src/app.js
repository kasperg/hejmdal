/**
 * @file
 * Configure and start oAuth2 hejmdal server
 */

import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import model from './oAuth2/oAuth2.memory.model';
import OAuthServer from 'express-oauth-server';
import initPassport from './oAuth2/passport';

const host = process.env.HOST;

const app = express();
initPassport(app);
app.oauth = new OAuthServer({
  model, // See https://github.com/oauthjs/node-oauth2-server for specification
  allowBearerTokensInQueryString: true,
  grants: ['password', 'authorization_code'],
  debug: true,
  allowEmptyState: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(
  session({
    secret: 'Super Secret Session Key',
    saveUninitialized: true,
    resave: true
  })
);

/**
 * Middleware for initializing oauth authorization.
 */
function authorizationMiddleware() {
  const options = {
    authenticateHandler: {
      handle: req => {
        return {id: '12345'};
      }
    }
  };
  return app.oauth.authorize(options);
}

/**
 * authorization
 * GET request:
 * - response_type=code - Indicates that your server expects to receive an authorization code
 * - client_id - The client ID you received when you first created the application
 * - redirect_uri - Indicates the URI to return the user to after authorization is complete
 * - scope - One or more scope values indicating which parts of the user's account you wish to access
 * - state - A random string generated by your application, which you'll verify later
 * verifies redirect_uri against client_id
 * response:
 * redirects to redirect_uri and adds authorizationCode in code and state from request is echoed back
 *
 */
app.get(
  '/oauth/authorize',
  (req, res, next) => {
    // Check if user is logged in (This could be done in a middleware)
    if (!req.session.user) {
      req.session.query = {
        state: req.query.state,
        scope: req.query.scope,
        client_id: req.query.client_id,
        redirect_uri: req.query.redirect_uri,
        response_type: req.query.response_type
      };

      return res.redirect('/login');
    }
    // If the user is not logged in, we should redirect user to an separate login endpoint
    next();
  },
  authorizationMiddleware()
);

app.post(
  '/oauth/authorize',
  (req, res, next) => {
    if (!req.session.user && !req.session.query) {
      return res.redirect('/login');
    }
    req.query = req.session.query;
    next();
  },
  authorizationMiddleware()
);

app.get('/login', (req, res) => {
  const html =
    '<html><body><form action="/login" method="post">' +
    '<h1>Log ind</h1>' +
    '<input type="hidden" name="userId" value="123">' +
    '<input type="submit" value="Log ind">' +
    '</form></body></html>';
  res.send(html);
});

app.post('/login', (req, res) => {
  const {userId} = req.body;
  if (!userId) {
    return res.redirect('/login');
  }

  req.session.user = userId;

  // If we were sent here from grant page, redirect back
  if (req.session.hasOwnProperty('query')) {
    return res.redirect(
      `/oauth/authorize/?${Object.entries(req.session.query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`
    );
  }

  // If not do whatever you fancy
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.user = null;
  if (req.query.access_token) {
    app.oauth.server.options.model.revokeToken(req.query.access_token);
  }
  res.send('User is logged out');
});

/**
 * Test callback endpoint
 */
app.get('/callback', (req, res) => {
  // Outputs curl commando for requesting access_token
  res.send(
    `
    <html><body>
    <h3>Lav følgende POST kald for at hente en token:</h3>
    <code>curl -X POST ${host}/oauth/token -d 'grant_type=authorization_code&code=${
      req.query.code
    }&client_id=hejmdal&client_secret=hejmdal_secret&redirect_uri=${host}/callback'</code>
    
    <h3>Lav derefter et kald til /userinfo med returnerede access_token, for at hente brugerinformation:</h3>

    <code>curl -X POST ${host}/userinfo -d 'access_token={ACCESS_TOKEN}'</code>
    </body></html>
    `
  );
});

/**
 * Get userinfo
 *
 * // curl -X POST http://localhost:3000/userinfo -d 'access_token={token}'
 */
app.post('/userinfo', app.oauth.authenticate(), (req, res) => {
  res.send({
    attributes: {
      userId: '0101701234',
      uniqueId:
        '8aa45d6b9e2cdec5322fa4c35cfd3ea271a3981ffcb5f75a994029522a3ec1a9',
      agencies: [
        {
          agencyId: '710100',
          userId: '0101701234',
          userIdType: 'CPR'
        },
        {
          agencyId: '714700',
          userId: '12345678',
          userIdType: 'LOCAL'
        }
      ]
    }
  });
});

/**
 * token.
 * POST request:
 * - grant_type=authorization_code - The grant type for this flow is authorization_code
 * - code=AUTH_CODE_HERE - This is the code you received in the query string
 * - redirect_uri=REDIRECT_URI - Must be identical to the redirect URI provided in the original link
 * - client_id=CLIENT_ID - The client ID you received when you first created the application
 * - client_secret=CLIENT_SECRET - Since this request is made from server-side code, the secret is included
 * Response:
 * { "access_token":"RsT5OjbzRn430zqMLgV3Ia", "expires_in":3600 }
 * or
 * { "error":"invalid_request" }
 *
 */
app.post('/oauth/token', app.oauth.token());

module.exports = app;

app.listen(process.env.PORT || 3000);
