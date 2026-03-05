import globals from 'globals'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import pluginImport from 'eslint-plugin-import'

export default [
  stylistic.configs.recommended,
  pluginJs.configs.recommended,
  pluginImport.flatConfigs.recommended,
  {
    files: [
      '**/*.{js, mjs}'
    ],
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      '**/*.config.js'
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'semi': 'off',
      '@stylistic/semi': ['error', 'never'],
      'indent': 'off',
      '@stylistic/indent': ['error', 2],
      'quotes': 'off',
      '@stylistic/quotes': ['error', 'single'],
      'arrow-parens': 'off',
      '@stylistic/arrow-parens': ['error', 'always'],
      'comma-dangle': 'off',
      '@stylistic/comma-dangle': ['error', {
        arrays: 'never',
        objects: 'always-multiline',
      }],
      'brace-style': 'off',
      '@stylistic/brace-style': ['error', '1tbs'],
      'import/no-extraneous-dependencies': ['error', {
        'devDependencies': [
          '__tests__/**',
          '__test__/**',
          '**/*.test.*',
          '**/*.spec.*',
          '**/test/**',
          '**/tests/**'
        ]
      }],
      // turn off extension rule to allow .js imports
      'import/extensions': 'off',
      // disable some advanced import checks that choke on ESM files
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
    settings: {
      'import/resolver': {
        'node': {
          'extensions': ['.js', '.mjs']
        }
      }
    },
  }
]
