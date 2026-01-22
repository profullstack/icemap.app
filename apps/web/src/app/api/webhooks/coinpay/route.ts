import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface WebhookPayload {
  id: string
  type: string
  data: {
    payment_id: string
    amount_crypto: string
    amount_usd: string
    currency: string
    status: string
    payment_address?: string
    confirmations?: number
    tx_hash?: string
    merchant_tx_hash?: string
    message?: string
    metadata?: {
      order_id?: string
      customer_email?: string
      [key: string]: string | undefined
    }
  }
  created_at: string
  business_id: string
}

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Signature format: t=timestamp,v1=hash
    const parts: Record<string, string> = {}
    for (const part of signature.split(',')) {
      const [key, value] = part.split('=')
      parts[key] = value
    }

    const timestamp = parts.t
    const expectedHash = parts.v1

    if (!timestamp || !expectedHash) {
      return false
    }

    // Check timestamp (reject if older than 5 minutes)
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp)
    if (Math.abs(age) > 300) {
      console.error('Webhook timestamp too old or in future:', { age, timestamp })
      return false
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`
    const computedHash = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex')

    // Timing-safe comparison using hex encoding
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(computedHash, 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.COINPAYPORTAL_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('Webhook secret not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  // Get raw body for signature verification
  const rawBody = await request.text()

  // Verify signature (check both header names for compatibility)
  const signature = request.headers.get('x-coinpay-signature') ?? request.headers.get('x-webhook-signature')
  if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
    console.error('Invalid webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: WebhookPayload

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Log the webhook event
  console.log('CoinPayPortal webhook received:', {
    type: payload.type,
    payment_id: payload.data?.payment_id,
    amount_usd: payload.data?.amount_usd,
    currency: payload.data?.currency,
    status: payload.data?.status,
  })

  // Handle different event types
  switch (payload.type) {
    case 'payment.confirmed':
      // Payment has been confirmed on the blockchain
      console.log(
        `Donation confirmed: $${payload.data.amount_usd} in ${payload.data.currency}`
      )
      // You could store this in the database, send a thank you email, etc.
      break

    case 'payment.forwarded':
      // Funds have been forwarded to merchant wallet
      console.log(
        `Donation forwarded: $${payload.data.amount_usd} in ${payload.data.currency}`,
        payload.data.merchant_tx_hash ? `tx: ${payload.data.merchant_tx_hash}` : ''
      )
      break

    case 'payment.expired':
      // Payment request expired without receiving funds
      console.log(`Donation expired: payment_id=${payload.data.payment_id}`)
      break

    case 'test.webhook':
      // Test webhook from CoinPayPortal dashboard
      console.log('Test webhook received successfully')
      break

    default:
      console.log(`Unknown webhook event: ${payload.type}`)
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true })
}
