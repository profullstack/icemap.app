import { before, describe, test } from 'node:test'
import assert from 'node:assert/strict'

// The guard reads its secret when lib/contact is first imported. No SMTP:
// a delivered message reaches the transport, which logs that it is skipping.
process.env.FORM_GUARD_SECRET = 'test-secret-not-used-anywhere-else'
for (const k of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'ADMIN_EMAIL', 'RESEND_API_KEY']) delete process.env[k]

type Contact = typeof import('@/lib/contact').contact
let contact: Contact
let POST: Contact['POST']

before(async () => {
  ;({ contact } = await import('@/lib/contact'))
  ;({ POST } = await import('./route'))
})

let ip = 0
const post = (body: Record<string, unknown>) =>
  POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': `198.51.100.${++ip}` },
      body: JSON.stringify(body),
    })
  )

/** Runs fn with console quiet, returning whether the transport was reached. */
async function reachedTransport(fn: () => Promise<void>) {
  const lines: string[] = []
  const { log, warn, error } = console
  console.log = (...a: unknown[]) => void lines.push(String(a[0]))
  console.warn = () => {}
  console.error = () => {}
  try {
    await fn()
  } finally {
    Object.assign(console, { log, warn, error })
  }
  return lines.some((l) => l.startsWith('SMTP not configured'))
}

const answers = {
  name: 'Test Person',
  email: 'test@example.invalid',
  subject: 'bug',
  message: 'The map does not load on my phone after the update.',
}

describe('POST /api/contact', () => {
  test("the page's form carries the token, the honeypot and the site's questions", async () => {
    const props = await contact.props()
    assert.equal(props.tokenField, 'fg_token')
    assert.ok(props.token)
    assert.ok(props.honeypotField)
    assert.deepEqual(
      props.questions.map((q) => q.name),
      ['name', 'email', 'subject', 'message']
    )
  })

  test('a POST without a token is answered like success and not delivered', async () => {
    let res!: Response
    const reached = await reachedTransport(async () => {
      res = await post(answers)
    })
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { success: true })
    assert.equal(reached, false)
  })

  test('a valid submission is delivered', async () => {
    const token = await contact.guard!.issue(Date.now() - 10_000)
    let res!: Response
    const reached = await reachedTransport(async () => {
      res = await post({ ...answers, fg_token: token })
    })
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { success: true })
    assert.equal(reached, true)
  })

  test('the old length rules still apply', async () => {
    const token = await contact.guard!.issue(Date.now() - 10_000)
    const short = await post({ ...answers, message: 'too short', fg_token: token })
    assert.equal(short.status, 400)
    assert.equal((await short.json()).error, 'Message is too short (10 characters at least)')
    const name = await post({ ...answers, name: 'A', fg_token: token })
    assert.equal((await name.json()).error, 'Name is too short (2 characters at least)')
  })
})
