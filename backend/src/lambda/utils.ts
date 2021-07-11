import { APIGatewayProxyEvent } from 'aws-lambda';
import { parseUserId } from '../auth/utils';

// Format JWK for use in jsonwebtoken verify function
export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  return parseUserId(jwtToken);
}
