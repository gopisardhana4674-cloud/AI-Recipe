import rateLimit from 'express-rate-limit';

// Standard rate limiter for general APIs
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Stricter rate limiter for heavy AI generation APIs
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many recipe generation requests. Please wait a minute before cooking up another request.'
  }
});
