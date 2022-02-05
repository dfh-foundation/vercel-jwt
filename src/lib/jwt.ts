import type { VercelRequest, VercelResponse } from '@vercel/node/dist'
import * as jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { UnauthorizedError } from './errors'

type AsyncVerifyFunction = (
  token: string,
  secretOrPublicKey: jwt.Secret | jwt.GetPublicKeyOrSecret,
  options: jwt.VerifyOptions & { complete: false },
  callback?: jwt.VerifyCallback<jwt.JwtPayload | string>
) => void

const jwtVerify = promisify(jwt.verify as AsyncVerifyFunction)

const DEFAULT_REVOKED_FUNCTION: IsRevokedCallback = async () => false

export type Secret = string | Buffer

export interface SecretCallbackLong {
  (req: VercelRequest, header: unknown, payload: unknown): Promise<Secret>
}
export interface SecretCallback {
  (req: VercelRequest, payload: unknown): Promise<Secret>
}
export interface IsRevokedCallback {
  (req: VercelRequest, payload: unknown): Promise<boolean>
}
export interface VercelJwtOptions extends Omit<jwt.VerifyOptions, 'complete'> {
  secret: Secret | SecretCallback | SecretCallbackLong
  credentialsRequired?: boolean
  isRevoked?: IsRevokedCallback
}
export interface JwtPayloadAndToken {
  payload: jwt.JwtPayload
  token: string
}

export interface VercelJwtRequestHandler {
  (req: VercelRequest, res: VercelResponse): Promise<JwtPayloadAndToken | undefined>
}

function isSecretCallback(
  secretCallback: SecretCallback | SecretCallbackLong
): secretCallback is SecretCallback {
  return secretCallback.length === 2
}

const wrapStaticSecretInCallback =
  (secret: Secret): SecretCallback =>
  async () =>
    secret

export const getTokenFromHeaders = (
  req: VercelRequest,
  credentialsRequired: boolean
): string | undefined => {
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ')
    if (parts.length !== 2) {
      throw new UnauthorizedError('credentials_bad_format', {
        message: 'Format is Authorization: Bearer [token]',
      })
    }

    const [scheme, credentials] = parts
    if (/^Bearer$/i.test(scheme)) {
      return credentials
    } else {
      if (credentialsRequired) {
        throw new UnauthorizedError('credentials_bad_scheme', {
          message: 'Format is Authorization: Bearer [token]',
        })
      }
    }
  }
  return
}

export const decodeToken = (token: string): jwt.Jwt => {
  let result
  try {
    result = jwt.decode(token, { complete: true })
  } catch (err) {
    throw new UnauthorizedError('invalid_token', err instanceof Error ? err : { message: `${err}` })
  }
  if (result == null) {
    throw new UnauthorizedError('invalid_token', {
      message: 'decoded token must be an object',
    })
  }
  return result
}

/**
 * Build function to authenticate request using JWT token in request
 * @param options
 * @return authentication function for requests
 */
export default (options: VercelJwtOptions): VercelJwtRequestHandler => {
  if (!options || !options.secret) throw new Error('secret should be set')

  if (!options.algorithms) throw new Error('algorithms should be set')
  if (!Array.isArray(options.algorithms)) throw new Error('algorithms must be an array')

  const secretCallback: SecretCallback | SecretCallbackLong =
    typeof options.secret === 'function'
      ? options.secret
      : wrapStaticSecretInCallback(options.secret)

  const isRevokedCallback = options.isRevoked || DEFAULT_REVOKED_FUNCTION

  const credentialsRequired =
    typeof options.credentialsRequired === 'undefined' ? true : options.credentialsRequired

  return async (
    req: VercelRequest,
    _res: VercelResponse
  ): Promise<JwtPayloadAndToken | undefined> => {
    if (req.method === 'OPTIONS' && req.headers['access-control-request-headers']) {
      const hasAuthInAccessControl = !!~req.headers['access-control-request-headers']
        .split(',')
        .map((header) => header.trim())
        .indexOf('authorization')

      if (hasAuthInAccessControl) {
        return
      }
    }

    const token = getTokenFromHeaders(req, credentialsRequired)

    if (!token) {
      if (credentialsRequired) {
        throw new UnauthorizedError('credentials_required', {
          message: 'No authorization token was found',
        })
      } else {
        return
      }
    }

    const getSecret = (): Promise<Secret> => {
      const decodedToken = decodeToken(token)
      if (isSecretCallback(secretCallback)) {
        return secretCallback(req, decodedToken.payload)
      }
      return secretCallback(req, decodedToken.header, decodedToken.payload)
    }

    const verifyToken = (secret: Secret): Promise<jwt.JwtPayload> =>
      jwtVerify(token, secret, { ...options, complete: false })
        .catch((err): never => {
          console.error('Token validation failed', err)
          throw new UnauthorizedError(
            'invalid_token',
            err instanceof Error ? err : { message: `${err}` }
          )
        })
        .then((payload): jwt.JwtPayload => {
          if (typeof payload === 'string' || payload == null) {
            throw new UnauthorizedError('invalid_token', {
              message: 'Decoded payload must be an object',
            })
          }
          return payload
        })

    const checkRevoked = (payload: jwt.JwtPayload): Promise<jwt.JwtPayload> =>
      isRevokedCallback(req, payload).then((revoked) => {
        if (revoked) {
          throw new UnauthorizedError('revoked_token', {
            message: 'The token has been revoked.',
          })
        }
        return payload
      })

    return getSecret()
      .then(verifyToken)
      .then(checkRevoked)
      .then((payload) => ({
        payload,
        token,
      }))
  }
}
