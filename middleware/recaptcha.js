/**
 * Google reCAPTCHA v2 Verification Middleware
 * Verifies the reCAPTCHA token sent from the frontend before allowing form submission.
 * Prevents spam/bot submissions on public forms.
 */

const verifyRecaptcha = async (req, res, next) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // If reCAPTCHA is not configured, skip verification (dev mode)
  if (!secretKey) {
    console.warn('⚠ reCAPTCHA secret key not set — skipping verification');
    return next();
  }

  const token = req.body.recaptchaToken || req.body['g-recaptcha-response'];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA verification failed. Please complete the captcha.'
    });
  }

  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    
    const response = await fetch(verifyUrl, { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      // Remove recaptcha fields from body so they don't get saved to DB
      delete req.body.recaptchaToken;
      delete req.body['g-recaptcha-response'];
      next();
    } else {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'reCAPTCHA verification error. Please try again.'
    });
  }
};

module.exports = { verifyRecaptcha };
