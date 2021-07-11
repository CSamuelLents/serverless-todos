import 'source-map-support/register';
import Axios from 'axios';
import {
  CustomAuthorizerResult,
  APIGatewayTokenAuthorizerEvent
} from 'aws-lambda';
import { verify, decode } from 'jsonwebtoken';

import { Jwt } from '../../auth/Jwt';
import { JwtPayload } from '../../auth/JwtPayload';
import { createLogger } from '../../utils/logger';
import { certToPEM } from '../utils';

const logger = createLogger('auth');
const jwksUrl = process.env.JWK_ENDPOINT;
let cert;

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing user', event.authorizationToken);

  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (error) {
    logger.error('User not authorized', { error: error.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
};

async function getJwks() {
  try {
    const { data } = await Axios.get(jwksUrl);

    if (!data.keys || !data.keys.length) {
      throw new Error('The JWKS endpoint did not contain any keys');
    }

    return data.keys;
  } catch (error) {
    logger.error('Failed to get JWKS: ', { error: error.message });
  }
}

async function getSigningKeys() {
  const keySet = await getJwks();
  const signingKeys = keySet
    .filter(
      (key) =>
        key.use === 'sig' && // JWK property `use` determines the JWK is for signature verification
        key.kty === 'RSA' && // We are only supporting RSA (RS256)
        key.kid && // The `kid` must be present to be useful for later
        ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
    )
    .map((key) => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
    });

  // If at least one signing key doesn't exist, we have a problem
  if (!signingKeys.length) {
    throw new Error(
      'The JWKS endpoint did not contain any signature verification keys'
    );
  }

  return signingKeys;
}

async function getJwkCert(kid) {
  try {
    // return cached cert when available
    if (cert) return cert;

    const signingKeys = await getSigningKeys();
    const signingKey = signingKeys.find((key) => key.kid === kid);

    if (!signingKey) {
      new Error(`Unable to find a signing key that matches '${kid}'`);
    } else {
      // cache the PEM
      cert = signingKey.publicKey;
    }

    return signingKey.publicKey;
  } catch (error) {
    logger.error('Failed to get JWKS: ', { error: error.message });
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = parseToken(authHeader);
  const decodedJwt: Jwt = decode(token, { complete: true }) as Jwt;

  // we are only supporting RS256, so fail if this happens.
  if (decodedJwt.header.alg !== 'RS256') {
    throw new Error('invalid algorithm');
  }

  const publicKey = await getJwkCert(decodedJwt.header.kid);

  return verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;
}

function parseToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');

  const parts = authHeader.split(' ');

  if (parts.length != 2) {
    throw new Error('credentials_required: No authorization token was found');
  }

  const scheme = parts[0];
  if (!/^Bearer$/i.test(scheme)) {
    throw new Error(
      'credentials_bad_scheme: Format is Authorization: Bearer [token]'
    );
  }

  return parts[1];
}
