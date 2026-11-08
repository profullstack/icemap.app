import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wwwRedirectLocation } from './www-redirect'

const h = (o: Record<string, string>) => new Headers(o)

test('www goes to the apex on https with path and query', () => {
  assert.equal(wwwRedirectLocation(h({ host: 'www.icemap.app' }), '/map', '?a=1'), 'https://icemap.pwa.pit.world/map?a=1')
})
test('never carries the internal port', () => {
  assert.equal(wwwRedirectLocation(h({ host: 'www.icemap.app:8080' }), '/', ''), 'https://icemap.pwa.pit.world/')
  assert.equal(
    wwwRedirectLocation(h({ host: '0.0.0.0:8080', 'x-forwarded-host': 'www.icemap.app' }), '/', ''),
    'https://icemap.pwa.pit.world/',
  )
})
test('apex passes through', () => {
  assert.equal(wwwRedirectLocation(h({ host: 'icemap.pwa.pit.world' }), '/', ''), null)
})
