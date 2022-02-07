import vercelJwt from './lib/jwt'
import vercelJwtAuthz, { getScopesFromJwtPayload } from './lib/authz'
import vercelJwtSecret from './lib/secret'

export { ForbiddenError, UnauthorizedError, sendForbiddenError } from './lib/errors'
export { getScopesFromJwtPayload, vercelJwt, vercelJwtAuthz, vercelJwtSecret }
