const express = require('express');
const server = express();
const session = require('cookie-session');
const { Issuer } = require('openid-client');
const PORT = 4001;
let client;

server.set('trust proxy', 1);
server.use(session({
  name: 'session_server_express100',
  keys: ['key1', 'key2']
}));

// for use with a self signed certificate
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


Issuer.discover('https://myportal.lemonldap.localhost:3001/.well-known/openid-configuration')
  .then(function (lemonldapIssuer) {
    console.log('Discovered issuer %s %O', lemonldapIssuer.issuer, lemonldapIssuer.metadata);
    return lemonldapIssuer;
  })
  .then(function(lemonldapIssuer){
    client = new lemonldapIssuer.Client({
      client_id: 'UDLy6MlgZ1GJx7mqCPBn7zcwjv',
      client_secret: 'mqCPBn7zcwjvaR',
      redirect_uris: ['http://localhost:'+PORT+'/redirect_oidc'],
      response_types: ['code'],
      id_token_signed_response_alg: "HS512", // changed default value
    }); 
  });



server.get("/login", (req, res) => {
  if( req.session.logged_in != true  ){
    const { generators } = require('openid-client');
    const code_verifier = generators.codeVerifier();
    // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
    // it should be httpOnly (not readable by javascript) and encrypted.
    req.session.opidc_code_verifier = code_verifier;
    console.log( 'code_verifier stored in session: '+code_verifier );
    
    const code_challenge = generators.codeChallenge(code_verifier);
    const nonce = generators.nonce();
    req.session.oidc_nonce = nonce;
    console.log( 'nonce stored in session: '+nonce );

    const state = generators.state();
    req.session.opidc_state= state;
    console.log( 'state stored in session: '+state );
    
    const url = client.authorizationUrl({
      scope: 'openid profile email gruppen',
      // resource: 'http://localhost:'+PORT+'/some_other_path', not needed for current lemonldap configuration
      code_challenge,
      code_challenge_method: 'S256',
      nonce: nonce,
      state:state
    });
    console.log( 'redirect to '+url  );
    res.redirect(301, url);
  } else {
    res.redirect(301, '/after_login');
  }
});

server.get("/redirect_oidc", (req, res) => {
  const code_verifier = req.session.opidc_code_verifier;
  console.log( 'code_verifier read out of  session: '+code_verifier );
  const nonce = req.session.oidc_nonce;
  console.log( 'nonce read out of  session: '+nonce );
  const state = req.session.opidc_state;
  console.log( 'state read out of  session: '+state );
  const params = client.callbackParams(req);
  console.log( params );
  client.callback('http://localhost:'+PORT+'/redirect_oidc', params, { code_verifier, nonce, state })
  .then(function (tokenSet) {
    console.log('received and validated tokens %j', tokenSet);
    console.log('validated ID Token claims %j', tokenSet.claims());
    return tokenSet.access_token;
  })
  .then(function(access_token){
        client.userinfo(access_token)
        .then(function (userinfo) {
          console.log('userinfo %j', userinfo);
          req.session.userinfo = userinfo;
          req.session.logged_in = true;
          delete req.session.opidc_code_verifier;
          delete req.session.opidc_state;
          delete req.session.opidc_nonce;
          res.redirect(301, '/after_login');
        });
  });
});

server.get("/after_login", (req, res) => {
  if( req.session.logged_in == true) {
    res.json({ message: "Hello world. Logged in. ", userinfo: req.session.userinfo});
  } else {
    res.json({ message: "Hello world. Not Logged in." });
  } 
});

server.get("/logout", (req, res) => {
  delete req.session.logged_in;
  delete req.session.userinfo;
  console.log('logout in this server finished');
  const url = client.endSessionUrl();
  console.log('Logout redirect url: '+ url)
  res.redirect(301, url);
});

server.listen(PORT, () => {
    console.log(`Server listening at ${'+PORT+'}`);
});
