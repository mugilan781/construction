/**
 * Input Sanitization Middleware
 * Strips HTML tags, script injections, and trims whitespace from all string inputs.
 * Prevents XSS (Cross-Site Scripting) attacks.
 */

// Strip all HTML tags from a string
function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags + content
    .replace(/<[^>]*>/g, '') // Remove all other HTML tags
    .trim();
}

// Recursively sanitize all string values in an object
function sanitizeObject(obj) {
  if (typeof obj === 'string') return stripHtml(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip stripping HTML for known rich-text fields
        if (key === 'about_description') {
           // Still remove script tags, but keep other HTML
           sanitized[key] = (typeof obj[key] === 'string') 
             ? obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim()
             : obj[key];
        } else {
           sanitized[key] = sanitizeObject(obj[key]);
        }
      }
    }
    return sanitized;
  }
  return obj;
}

// Express middleware
const sanitizeInputs = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = { sanitizeInputs, stripHtml, sanitizeObject };
