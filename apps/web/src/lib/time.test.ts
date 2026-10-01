import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getTimeAgo, getTimeUntil } from './time'

const ago = (s: number) => new Date(Date.now() - s * 1000)
const ahead = (s: number) => new Date(Date.now() + s * 1000)

test('getTimeAgo buckets by unit', () => {
  assert.equal(getTimeAgo(ago(5)), 'Just now')
  assert.equal(getTimeAgo(ago(5 * 60)), '5m ago')
  assert.equal(getTimeAgo(ago(3 * 3600)), '3h ago')
  assert.equal(getTimeAgo(ago(2 * 86400)), '2d ago')
})

test('getTimeUntil counts down to expiry', () => {
  assert.equal(getTimeUntil(ago(1)), 'expired')
  assert.equal(getTimeUntil(ahead(30)), 'in less than a minute')
  assert.equal(getTimeUntil(ahead(10 * 60 + 5)), 'in 10m')
  assert.equal(getTimeUntil(ahead(2 * 3600 + 15 * 60 + 5)), 'in 2h 15m')
  assert.equal(getTimeUntil(ahead(86400 + 3600 + 5)), 'in 1d 1h')
})
