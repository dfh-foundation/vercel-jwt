import test from 'ava'
import {
  default as vercelJwt,
  getTokenFromCookieNamed,
  getTokenFromHeaders,
  GetTokenResult,
  VercelJwtOptions,
} from './jwt'
import * as sinon from 'ts-sinon'
import type { VercelRequest } from '@vercel/node/dist'

test('getTokenFromHeaders() should return undefined with empty header', (t) => {
  const req = sinon.stubInterface<VercelRequest>()
  const result = getTokenFromHeaders(req)
  t.deepEqual(result, { success: true, value: undefined })
})

test('getTokenFromHeaders() should return bad format error', (t) => {
  const req = sinon.stubInterface<VercelRequest>()
  req.headers.authorization = 'Bearer_bad'
  const result = getTokenFromHeaders(req)
  t.deepEqual(result, {
    success: false,
    code: 'credentials_bad_format',
    message: 'Format is Authorization: Bearer [token]',
  })
})

test('getTokenFromHeaders() should return bad scheme error', (t) => {
  const req = sinon.stubInterface<VercelRequest>()
  req.headers.authorization = 'BadScheme token'
  const result = getTokenFromHeaders(req)
  t.deepEqual(result, {
    success: false,
    code: 'credentials_bad_scheme',
    message: 'Format is Authorization: Bearer [token]',
  })
})

test('getTokenFromHeaders() should return token', (t) => {
  const req = sinon.stubInterface<VercelRequest>()
  req.headers.authorization = 'Bearer token'
  const result = getTokenFromHeaders(req)
  t.deepEqual(result, { success: true, value: 'token' })
})

test('getTokenFromCookieNamed() should return token', (t) => {
  const req = sinon.stubInterface<VercelRequest>()
  req.headers.cookie = 'SomeCookie=test1; AnotherCookie=test2; access_token=token'
  const result = getTokenFromCookieNamed('access_token')(req)
  t.deepEqual(result, { success: true, value: 'token' })
})

test('getTokenFromCookieNamed() should return bad format error', (t) => {
  const req = sinon.stubInterface<VercelRequest>()
  req.headers.cookie = 'SomeCookie=test1; AnotherCookie=test2; access_token=badtoken%A'
  const result = getTokenFromCookieNamed('access_token')(req)
  t.is(result.success, false)
  t.is((result as GetTokenResult & { success: false }).code, 'credentials_bad_format')
})

test('default should return request handler', (t) => {
  const options: VercelJwtOptions = {
    secret: 'static_secret',
    algorithms: ['RS256'],
  }
  const result = vercelJwt(options)
  t.is(typeof result, 'function')
})
