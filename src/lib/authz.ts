import type { VercelRequest, VercelResponse } from '@vercel/node'
import { JwtPayload } from 'jsonwebtoken'
import { ForbiddenError } from './errors'

export interface VercelJwtAuthzOptions {
  customScopeKey?: string
  checkAllScopes?: boolean
}
export interface VercelJwtAuthzRequestHandler {
  (req: VercelRequest, res: VercelResponse, payload?: JwtPayload): Promise<void>
}

export const getScopesFromUser = (user: JwtPayload, scopeKey: string): string[] | undefined => {
  if (typeof user[scopeKey] === 'string') {
    return user[scopeKey].split(' ')
  } else if (Array.isArray(user[scopeKey])) {
    return user[scopeKey]
  }
  return
}

/**
 * Build function to verify required scope(s) in decoded user token
 * @param expectedScopes
 * @param options
 * @return authorization function for requests
 */
export default (
  expectedScopes: string[],
  options?: VercelJwtAuthzOptions
): VercelJwtAuthzRequestHandler => {
  if (!Array.isArray(expectedScopes)) {
    throw new Error(
      'Parameter expectedScopes must be an array of strings representing the scopes for the endpoint(s)'
    )
  }

  return async (_req: VercelRequest, _res: VercelResponse, payload?: JwtPayload): Promise<void> => {
    if (expectedScopes.length === 0) {
      return
    }

    const scopeKey = (options && options.customScopeKey) || 'scope'

    if (!payload) {
      throw new ForbiddenError('JWT payload missing', expectedScopes)
    }

    const userScopes = getScopesFromUser(payload, scopeKey)
    if (!userScopes) {
      throw new ForbiddenError('Insufficient scope', expectedScopes)
    }

    const allowed =
      options && options.checkAllScopes
        ? expectedScopes.every((scope) => userScopes.includes(scope))
        : expectedScopes.some((scope) => userScopes.includes(scope))

    if (!allowed) {
      throw new ForbiddenError('Insufficient scope', expectedScopes)
    }
  }
}
