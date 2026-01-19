'use client'

import { useState, useEffect, useCallback } from 'react'
import { track, events } from '@/lib/analytics'

interface Coin {
  symbol: string
  name: string
}

interface PaymentDetails {
  payment_id: string
  amount_usd: string
  amount_crypto: string
  currency: string
  payment_address: string
  expires_at: string
  status?: string
  confirmed_at?: string
  tx_hash?: string
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100]

// Map coin symbols to currency codes for the API
const CURRENCY_MAP: Record<string, string> = {
  BTC: 'btc',
  ETH: 'eth',
  SOL: 'sol',
  POL: 'pol',
  USDC: 'usdc_pol', // Default to Polygon for lower fees
  USDT: 'usdt',
  BNB: 'bnb',
  XRP: 'xrp',
  ADA: 'ada',
  DOGE: 'doge',
  BCH: 'bch',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Waiting for payment', color: 'text-yellow-500' },
  confirming: { label: 'Confirming on blockchain', color: 'text-blue-400' },
  confirmed: { label: 'Payment confirmed!', color: 'text-green-400' },
  forwarded: { label: 'Payment complete!', color: 'text-green-400' },
  expired: { label: 'Payment expired', color: 'text-red-400' },
  failed: { label: 'Payment failed', color: 'text-red-400' },
}

export default function DonateForm() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loadingCoins, setLoadingCoins] = useState(true)
  const [amount, setAmount] = useState<number>(10)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedCoin, setSelectedCoin] = useState<string>('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)

  // Fetch supported coins on mount
  useEffect(() => {
    fetchCoins()
  }, [])

  // Poll for payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!payment?.payment_id) return

    try {
      const res = await fetch(`/api/donate/status?payment_id=${payment.payment_id}`)
      if (res.ok) {
        const data = await res.json()
        setPayment((prev) => prev ? { ...prev, ...data } : null)

        // Stop polling if payment is complete or expired
        if (['confirmed', 'forwarded', 'expired', 'failed'].includes(data.status)) {
          if (data.status === 'confirmed' || data.status === 'forwarded') {
            track('donate_confirmed', { payment_id: payment.payment_id })
          }
          return false // Signal to stop polling
        }
      }
    } catch (err) {
      console.error('Failed to check payment status:', err)
    }
    return true // Continue polling
  }, [payment?.payment_id])

  useEffect(() => {
    if (!payment?.payment_id) return

    // Start polling every 5 seconds
    const pollInterval = setInterval(async () => {
      const shouldContinue = await checkPaymentStatus()
      if (!shouldContinue) {
        clearInterval(pollInterval)
      }
    }, 5000)

    // Initial check
    checkPaymentStatus()

    return () => clearInterval(pollInterval)
  }, [payment?.payment_id, checkPaymentStatus])

  async function fetchCoins() {
    try {
      const res = await fetch('/api/donate/coins')
      if (res.ok) {
        const data = await res.json()
        setCoins(data.coins || [])
        // Default to USDC if available (low fees)
        if (data.coins?.some((c: Coin) => c.symbol === 'USDC')) {
          setSelectedCoin('USDC')
        } else if (data.coins?.length > 0) {
          setSelectedCoin(data.coins[0].symbol)
        }
      }
    } catch (err) {
      console.error('Failed to fetch coins:', err)
    } finally {
      setLoadingCoins(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    const finalAmount = customAmount ? parseFloat(customAmount) : amount
    if (!finalAmount || finalAmount < 1) {
      setError('Please enter an amount of at least $1')
      return
    }

    if (!selectedCoin) {
      setError('Please select a cryptocurrency')
      return
    }

    setSubmitting(true)
    setError(null)
    track(events.DONATE_START, { amount: finalAmount, currency: selectedCoin })

    try {
      const res = await fetch('/api/donate/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: CURRENCY_MAP[selectedCoin] || selectedCoin.toLowerCase(),
          message: message.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create payment')
      }

      const paymentData = await res.json()
      setPayment({ ...paymentData, status: 'pending' })
      track(events.DONATE_CREATED, { payment_id: paymentData.payment_id, amount: finalAmount })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      track(events.DONATE_ERROR, { error: err instanceof Error ? err.message : 'unknown' })
    } finally {
      setSubmitting(false)
    }
  }

  async function copyToClipboard(text: string, type: 'address' | 'amount') {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'address') {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } else {
        setCopiedAmount(true)
        setTimeout(() => setCopiedAmount(false), 2000)
      }
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      if (type === 'address') {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } else {
        setCopiedAmount(true)
        setTimeout(() => setCopiedAmount(false), 2000)
      }
    }
  }

  // Payment created - show payment details
  if (payment) {
    const expiresAt = new Date(payment.expires_at)
    const minutesLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60000))
    const isComplete = payment.status === 'confirmed' || payment.status === 'forwarded'
    const isExpired = payment.status === 'expired' || payment.status === 'failed'
    const statusInfo = STATUS_LABELS[payment.status || 'pending'] || STATUS_LABELS.pending

    return (
      <div className="glass rounded-2xl p-8 border border-white/10">
        <div className="text-center mb-6">
          {isComplete ? (
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : isExpired ? (
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <h2 className="text-xl font-bold text-white mb-2">
            {isComplete ? 'Thank You!' : isExpired ? 'Payment Expired' : 'Send Your Donation'}
          </h2>
          {!isComplete && !isExpired && (
            <p className="text-gray-400 text-sm">
              Send exactly <span className="text-white font-mono">{payment.amount_crypto} {payment.currency.toUpperCase()}</span> to the address below
            </p>
          )}
          {isComplete && (
            <p className="text-gray-400 text-sm">
              Your donation of <span className="text-white font-mono">${payment.amount_usd}</span> has been received!
            </p>
          )}
        </div>

        {/* Status indicator */}
        <div className={`flex items-center justify-center gap-2 mb-4 ${statusInfo.color}`}>
          {!isComplete && !isExpired && (
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          )}
          <span className="text-sm font-medium">{statusInfo.label}</span>
        </div>

        <div className="space-y-4">
          {/* Amount */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Amount</p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-white font-mono text-lg">{payment.amount_crypto} {payment.currency.toUpperCase()}</p>
                <p className="text-gray-500 text-sm">${payment.amount_usd} USD</p>
              </div>
              {!isComplete && !isExpired && (
                <button
                  onClick={() => copyToClipboard(payment.amount_crypto, 'amount')}
                  className={`p-2 rounded-lg transition-colors ${
                    copiedAmount ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                  title="Copy amount"
                >
                  {copiedAmount ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Address */}
          {!isExpired && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Payment Address</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono text-sm break-all flex-1">{payment.payment_address}</p>
                {!isComplete && (
                  <button
                    onClick={() => copyToClipboard(payment.payment_address, 'address')}
                    className={`p-2 rounded-lg transition-colors ${
                      copiedAddress ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                    title="Copy address"
                  >
                    {copiedAddress ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Transaction hash if confirmed */}
          {payment.tx_hash && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Transaction Hash</p>
              <p className="text-white font-mono text-xs break-all">{payment.tx_hash}</p>
            </div>
          )}

          {/* Timer - only show if pending */}
          {!isComplete && !isExpired && (
            <div className="flex items-center justify-center gap-2 text-yellow-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expires in {minutesLeft} minutes</span>
            </div>
          )}

          {/* New donation button */}
          <button
            onClick={() => setPayment(null)}
            className="w-full mt-4 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm"
          >
            {isComplete ? 'Make Another Donation' : isExpired ? 'Try Again' : 'Cancel & Start Over'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-white/10">
      {/* Amount selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Donation Amount (USD)
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset)
                setCustomAmount('')
              }}
              className={`py-3 rounded-xl text-sm font-medium transition-all ${
                amount === preset && !customAmount
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number"
            min="1"
            max="10000"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Custom amount"
            className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Cryptocurrency selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Cryptocurrency
        </label>
        {loadingCoins ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          </div>
        ) : coins.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            No payment methods available
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {coins.map((coin) => (
              <button
                key={coin.symbol}
                type="button"
                onClick={() => setSelectedCoin(coin.symbol)}
                className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCoin === coin.symbol
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {coin.symbol}
              </button>
            ))}
          </div>
        )}
        {selectedCoin && (
          <p className="text-gray-500 text-xs mt-2">
            {selectedCoin === 'USDC' || selectedCoin === 'SOL' || selectedCoin === 'POL'
              ? 'Low network fees'
              : selectedCoin === 'BTC' || selectedCoin === 'ETH'
              ? 'Higher network fees'
              : ''}
          </p>
        )}
      </div>

      {/* Optional message */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Message (Optional)
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={100}
          placeholder="Leave a message with your donation"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || loadingCoins || !selectedCoin}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Creating Payment...
          </span>
        ) : (
          `Donate $${customAmount || amount} in ${selectedCoin || 'Crypto'}`
        )}
      </button>
    </form>
  )
}
