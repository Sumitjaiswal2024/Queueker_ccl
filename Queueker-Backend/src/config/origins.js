// Allowed browser origins for both Express CORS and the Socket.IO `cors` option.
//
// Sources, merged and de-duplicated:
//   CORS_ORIGINS    comma-separated list (new, preferred)
//   ALLOWED_ORIGIN  comma-separated list (legacy; Render already uses this)
// If neither is set, the original local-development defaults apply, so
// behaviour is unchanged until you set one of them.
//
// Matching is exact on purpose (no wildcards such as *.cloudfront.net, which
// would allow every CloudFront distribution in the world).

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

// Browsers send the Origin header without a trailing slash, so strip it from
// configured values to avoid "https://x.cloudfront.net/" never matching.
function normalize(origin) {
    return origin.trim().replace(/\/+$/, '');
}

function parseList(value) {
    return (value || '').split(',').map(normalize).filter(Boolean);
}

function getAllowedOrigins(env = process.env) {
    const merged = [...parseList(env.CORS_ORIGINS), ...parseList(env.ALLOWED_ORIGIN)];
    const unique = [...new Set(merged)];
    return unique.length > 0 ? unique : [...DEFAULT_ORIGINS];
}

module.exports = { getAllowedOrigins, DEFAULT_ORIGINS };
