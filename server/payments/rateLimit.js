const buckets = new Map();

function paymentRateLimit(req, res, next) {
  const windowMs = Number(process.env.PAYMENT_RATE_LIMIT_WINDOW_MS) || 900_000;
  const max = Number(process.env.PAYMENT_RATE_LIMIT_MAX) || 20;
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return res.status(429).json({
      code: 'RATE_LIMITED',
      message: 'Too many payment attempts. Please wait and try again.',
    });
  }

  next();
}

module.exports = { paymentRateLimit };
