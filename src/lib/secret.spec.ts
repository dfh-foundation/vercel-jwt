import test from 'ava'
import { default as vercelJwtSecret, VercelJwtSecretOptions } from './secret'

test('default should return secret provider', (t) => {
  const options: VercelJwtSecretOptions = {
    jwksUri: 'http://localhost/.well-known/jwks.json',
  }
  const handler = vercelJwtSecret(options)
  t.is(typeof handler, 'function')
})
