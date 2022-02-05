import jwksRsa from 'jwks-rsa'
import { GetPublicKeyOrSecret, Secret, SigningKeyCallback } from 'jsonwebtoken'
import { ArgumentError } from './errors'

const handleSigningKeyError = (
  err: Error,
  callback: (err: unknown, secret?: Secret) => void
): void => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return callback(null, '')
  }

  // If an error occurred like rate limiting or HTTP issue, we'll bubble up the error.
  return callback(err)
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
  handleSigningKeyError?: (err: Error, callback: (err: unknown, secret?: Secret) => void) => void
}

/**
 * Build function to provide secret from well known keys to use in JWT validation
 * @param options
 * @return secret provider function
 */
export default (options: VercelJwtSecretOptions): GetPublicKeyOrSecret => {
  if (options == null) {
    throw new ArgumentError('An options object must be provided when initializing vercelJwtSecret')
  }

  const client = jwksRsa(options)
  const onError = options.handleSigningKeyError || handleSigningKeyError

  return (header, callback: SigningKeyCallback): void => {
    // Only RS256 is supported.
    if (!header || header.alg !== 'RS256') {
      return callback(new Error(`RS256 algorithm required - header: ${JSON.stringify(header)}`))
    }

    return client.getSigningKey(header.kid, (err, signingKey) => {
      if (err) {
        return onError(err, callback)
      }
      return callback(null, signingKey.getPublicKey())
    })
  }
}
