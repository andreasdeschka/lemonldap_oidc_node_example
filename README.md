# Dockerized example for authentication in node express app with LemonLDAP server using node open-id client
Setup: An [express](https://expressjs.com/) node app is the OpenID Connect Relying Party (Client). A [Lemonldap](https://lemonldap-ng.org/start) server is the [Open ID Connect] (https://openid.net/connect/faq/) provider. The protocol is  [Authorization Code Flow](https://auth0.com/docs/flows/concepts/auth-code). The epress app uses the OpenID Connect certified [open-id client](https://github.com/panva/node-openid-client) package.
It is not meant to be used in production. It is only an example for demonstration and testing. 

## Installation und Start
    git clone https://github.com/andreasdeschka/lemonldap_oidc_node_example
    cd lemonldap_oidc_node_example
    docker-compose up -d
    
## Debugging

    docker-compose logs -t lemonldap
    
    docker-compose logs -t lemonldap    

## Usage 

### Client:
Start login: http://localhost:4001/login

Start logout: http://localhost:4001/logout

Status of login: http://localhost:4001/after_login

User name: dhwo, Password: dwho

### Server:
Configuration of the lemonldap Server: https://mymanager.lemonldap.localhost:3001/

OIDC-Configuration endpoint: https://myportal.lemonldap.localhost:3001/.well-known/openid-configuration

User name: dhwo, Password: dwho

### Konfiguration of the Lemonldap

#### Steps after a fresh installation to register an OpenId Client

'General Parameters' - 'Issuer Modules` - `OpenId Connect` - `Activation`: on

`OpenID Connect Relying Parties` - `Add OpenID Relying Party`, and enter there all the relevant data.

'General Parameters' - `Advanced Parameters` - `Security` - `Content Security Policy` - `Form Destinations`: add there the url or the OIDC client for the redirection (same as already entered for the client) (otherwise, browsers will refuse to do the redirection)

#### Further Documentation
https://lemonldap-ng.org/documentation/2.0/start

## Reasons for some setup decisions

The Haproxy is used, so that the OIDC-Server can run with HTTPS-Encryption. It would be possible to provide the certificates also to the Lemonldap Container, but this setup was easier.

The Host name of the OIDC-Server (myportal.lemonldap.localhost) cannot be just localhost because cookies would not be set otherwise. The host name has to have at least one dot. And because one maybe later wants to use other subdomains on the lemonldap server the single sign on cookie is set for lemonldap.localhost.

In the express app I had to deactivate checking the server certificates because the lemonldap runs with a self signed certificate.





