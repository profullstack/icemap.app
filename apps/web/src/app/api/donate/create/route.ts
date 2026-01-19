import { NextRequest, NextResponse } from 'next/server'

const COINPAY_API_URL = 'https://coinpayportal.com/api'

export async function POST(request: NextRequest) {
  const merchantId = process.env.COINPAYPORTAL_MERCHANT_ID
  const apiKey = process.env.COINPAYPORTAL_API_KEY

  if (!merchantId || !apiKey) {
    return NextResponse.json(
      { error: 'Payment system not configured' },
      { status: 503 }
    )
  }

  let body: { amount: number; currency: string; message?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { amount, currency, message } = body

  // Validate amount
  if (!amount || amount < 1 || amount > 10000) {
    return NextResponse.json(
      { error: 'Amount must be between $1 and $10,000' },
      { status: 400 }
    )
  }

  // Validate currency
  if (!currency || typeof currency !== 'string') {
    return NextResponse.json(
      { error: 'Currency is required' },
      { status: 400 }
    )
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://icemap.app'

    const res = await fetch(`${COINPAY_API_URL}/payments/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        business_id: merchantId,
        amount_usd: amount,
        currency: currency.toLowerCase(),
        description: message
          ? `Donation to icemap.app: ${message.slice(0, 100)}`
          : 'Donation to icemap.app',
        redirect_url: `${appUrl}/donate/thank-you`,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('CoinPayPortal payment error:', res.status, errorText)
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 502 }
      )
    }

    const data = await res.json()

    if (!data.success || !data.payment) {
      return NextResponse.json(
        { error: 'Invalid response from payment provider' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      payment_id: data.payment.id,
      amount_usd: data.payment.amount_usd,
      amount_crypto: data.payment.amount_crypto,
      currency: data.payment.currency,
      payment_address: data.payment.payment_address,
      expires_at: data.payment.expires_at,
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
