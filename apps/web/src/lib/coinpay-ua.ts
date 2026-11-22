import pkg from '../../package.json'

/**
 * Names icemap.app on every server-side call to CoinPay, so CoinPay's logs and
 * throttle can tell the fleet's apps (all on one IP) apart instead of seeing
 * a bare `node`.
 */
export const COINPAY_UA = `icemap.app/${pkg.version} (+https://icemap.app)`
