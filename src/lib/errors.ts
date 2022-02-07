import type { VercelResponse } from '@vercel/node/dist'

type ErrorLike = Error | { message: string }

export class ForbiddenError extends Error {
  expectedScopes: string[]

  constructor(message: string, expectedScopes: string[]) {
    super(message)
    this.name = 'ForbiddenError'
    this.expectedScopes = expectedScopes
  }
}

export const sendForbiddenError = (res: VercelResponse, err: ForbiddenError): void => {
  res.setHeader(
    'WWW-Authenticate',
    `Bearer scope="${err.expectedScopes.join(' ')}", error="${err.message}"`
  )
  res.status(403).send(err.message)
}

export type ErrorCode =
  | 'revoked_token'
  | 'invalid_token'
  | 'credentials_bad_scheme'
  | 'credentials_bad_format'
  | 'credentials_required'

export class ArgumentError extends Error {
  name = 'ArgumentError'
  constructor(message: string) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class UnauthorizedError extends Error {
  name = 'UnauthorizedError'
  code: ErrorCode
  status: number
  inner: ErrorLike

  constructor(code: ErrorCode, error: ErrorLike) {
    super(error.message)
    Error.captureStackTrace(this, this.constructor)
    this.code = code
    this.status = 401
    this.inner = error
  }
}
