import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginImport from 'eslint-plugin-import';

export default [
  pluginJs.configs.recommended,
  pluginImport.flatConfigs.recommended,
  {
    files: [
      '**/*.{js,mjs}',
    ],
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      '**/*.config.js',
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
      semi: ['error', 'always'],
      indent: ['error', 2],
      quotes: ['error', 'single'],
      'arrow-parens': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'brace-style': ['error', '1tbs'],
      'object-curly-newline': ['error', { multiline: true }],
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroupsExcludedImportTypes: ['builtin'],
      }],
      'arrow-body-style': ['error', 'as-needed'],
      'max-len': ['error', { code: 100 }],
      'no-restricted-syntax': ['error', 'ForInStatement', 'ForOfStatement', 'LabeledStatement', 'WithStatement'],
      'no-await-in-loop': 'error',
      'no-shadow': ['error', { builtinGlobals: false, hoist: 'all', allow: [] }],
      'prefer-destructuring': ['error', { VariableDeclarator: { array: false, object: true }, AssignmentExpression: { array: true, object: true } }, { enforceForRenamedProperties: false }],
      'quote-props': ['error', 'as-needed'],
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: [
          '__tests__/**',
          '__test__/**',
          '**/*.test.*',
          '**/*.spec.*',
          '**/test/**',
          '**/tests/**',
        ],
      }],
      'no-useless-escape': 'off',
      'import/extensions': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.mjs'],
        },
      },
    },
  },
];


