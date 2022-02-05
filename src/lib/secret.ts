import type { VercelRequest } from '@vercel/node/dist'
import jwksRsa from 'jwks-rsa'
import { JwtHeader, JwtPayload } from 'jsonwebtoken'
import { promisify } from 'util'
import { Secret } from './jwt'

const handleSigningKeyError = (err: Error): Secret => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return ''
  }

  // If an error occurred like rate limiting or HTTP issue, we'll bubble up the error.
  throw err
}

export interface VercelJwtSecretOptions {
  jwksUri: string
  rateLimit?: boolean
  cache?: boolean
  cacheMaxEntries?: number
  cacheMaxAge?: number
  jwksRequestsPerMinute?: number
  proxy?: string
  strictSsl?: boolean
  requestHeaders?: jwksRsa.Headers
  timeout?: number
  handleSigningKeyError?: (err: Error) => Secret
}

export interface VercelJwtSecretProvider {
  (req: VercelRequest, header: JwtHeader, payload: JwtPayload | string): Promise<Secret>
}

/**
 * Build function to provide secret from well known keys to use in JWT validation
 * @param options
 * @return secret provider function
 */
export default (options: VercelJwtSecretOptions): VercelJwtSecretProvider => {
  if (options == null) {
    throw new jwksRsa.ArgumentError(
      'An options object must be provided when initializing vercelJwtSecret'
    )
  }

  const client = jwksRsa(options)
  const onError = options.handleSigningKeyError || handleSigningKeyError
  const getSigningKey = promisify(client.getSigningKey)

  return (_req, header, _payload): Promise<Secret> => {
    // Only RS256 is supported.
    if (!header || header.alg !== 'RS256') {
      return Promise.reject(`RS256 algorithm required - header: ${JSON.stringify(header)}`)
    }

    return getSigningKey(header.kid)
      .then((key) => key.getPublicKey())
      .catch(onError)
  }
}
