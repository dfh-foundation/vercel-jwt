import test from 'ava'
import { default as vercelJwtAuthz, VercelJwtAuthzOptions } from './authz'

test('default should return request handler', (t) => {
  const expectedScopes = ['read:current_user']
  const options: VercelJwtAuthzOptions = {}
  const handler = vercelJwtAuthz(expectedScopes, options)
  t.is(typeof handler, 'function')
})
