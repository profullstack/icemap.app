import { NextRequest, NextResponse } from 'next/server'

const COINPAY_API_URL = 'https://coinpayportal.com/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('payment_id')

  if (!paymentId) {
    return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
  }

  const apiKey = process.env.COINPAYPORTAL_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Payment system not configured' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(`${COINPAY_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('CoinPayPortal status error:', res.status, errorText)
      return NextResponse.json(
        { error: 'Failed to check payment status' },
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
      status: data.payment.status,
      amount_usd: data.payment.amount_usd,
      amount_crypto: data.payment.amount_crypto,
      currency: data.payment.currency,
      payment_address: data.payment.payment_address,
      expires_at: data.payment.expires_at,
      confirmed_at: data.payment.confirmed_at,
      tx_hash: data.payment.tx_hash,
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
