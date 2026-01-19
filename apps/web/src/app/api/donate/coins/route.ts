import { NextResponse } from 'next/server'

const COINPAY_API_URL = 'https://coinpayportal.com/api'

export async function GET() {
  const merchantId = process.env.COINPAYPORTAL_MERCHANT_ID
  const apiKey = process.env.COINPAYPORTAL_API_KEY

  if (!merchantId || !apiKey) {
    return NextResponse.json(
      { error: 'Payment system not configured' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(
      `${COINPAY_API_URL}/supported-coins?business_id=${merchantId}&active_only=true`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!res.ok) {
      console.error('CoinPayPortal API error:', res.status, await res.text())
      return NextResponse.json(
        { error: 'Failed to fetch supported coins' },
        { status: 502 }
      )
    }

    const data = await res.json()

    // Transform to simpler format for frontend
    const coins = (data.coins || [])
      .filter((coin: { is_active: boolean; has_wallet: boolean }) => coin.is_active && coin.has_wallet)
      .map((coin: { symbol: string; name: string }) => ({
        symbol: coin.symbol,
        name: coin.name,
      }))

    return NextResponse.json({ coins })
  } catch (error) {
    console.error('Error fetching coins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supported coins' },
      { status: 500 }
    )
  }
}
