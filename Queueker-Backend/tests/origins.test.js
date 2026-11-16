const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllowedOrigins, DEFAULT_ORIGINS } = require('../src/config/origins');

test('defaults to local dev origins when nothing is set', () => {
    assert.deepEqual(getAllowedOrigins({}), DEFAULT_ORIGINS);
});

test('empty strings fall back to the defaults', () => {
    assert.deepEqual(getAllowedOrigins({ CORS_ORIGINS: '', ALLOWED_ORIGIN: '  ' }), DEFAULT_ORIGINS);
});

test('legacy ALLOWED_ORIGIN alone behaves as before', () => {
    const env = { ALLOWED_ORIGIN: 'https://queueker-frontend.onrender.com' };
    assert.deepEqual(getAllowedOrigins(env), ['https://queueker-frontend.onrender.com']);
});

test('CORS_ORIGINS is comma-separated and trimmed', () => {
    const env = { CORS_ORIGINS: ' https://a.cloudfront.net , http://localhost:5173 ' };
    assert.deepEqual(getAllowedOrigins(env), ['https://a.cloudfront.net', 'http://localhost:5173']);
});

test('both variables are merged so adding CloudFront does not drop Render', () => {
    const env = {
        ALLOWED_ORIGIN: 'https://queueker-frontend.onrender.com',
        CORS_ORIGINS: 'https://d111111abcdef8.cloudfront.net'
    };
    assert.deepEqual(getAllowedOrigins(env), [
        'https://d111111abcdef8.cloudfront.net',
        'https://queueker-frontend.onrender.com'
    ]);
});

test('duplicates are removed and trailing slashes stripped', () => {
    const env = {
        CORS_ORIGINS: 'https://x.cloudfront.net/,https://x.cloudfront.net',
        ALLOWED_ORIGIN: 'https://x.cloudfront.net//'
    };
    assert.deepEqual(getAllowedOrigins(env), ['https://x.cloudfront.net']);
});

test('no wildcard expansion: a bare * is kept literally and matches nothing', () => {
    assert.deepEqual(getAllowedOrigins({ CORS_ORIGINS: '*' }), ['*']);
});
