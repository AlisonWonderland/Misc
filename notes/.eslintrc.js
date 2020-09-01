module.exports = {
    'env': {
        'node': true,
        'browser': true,
        'commonjs': true,
        'es2020': true,
        'jest': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 12
    },
    'rules': {
        'eqeqeq': 'error',
        'no-trailing-spaces': 'error',
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'windows'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never'
        ]
    }
}
