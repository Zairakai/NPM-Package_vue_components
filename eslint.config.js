/**
 * ESLint configuration for @zairakai/vue-components.
 * Uses local eslint-plugin-vue v10 (compatible with ESLint 10).
 */

import pluginJs from '@eslint/js'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'
import parserTypeScript from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'

export default [
  // Base JavaScript rules
  pluginJs.configs.recommended,

  // Vue configurations (using local eslint-plugin-vue v10)
  ...pluginVue.configs['flat/strongly-recommended'],

  // Prettier integration (must be last)
  eslintConfigPrettier,

  // Base configuration for all files
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      yoda: [
        'error',
        'always',
        {
          exceptRange: true,
          onlyEquality: false,
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info', 'debug'],
        },
      ],
      'no-debugger': 'error',
      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore',
        },
      ],
      curly: ['error', 'all'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/valid-template-root': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-v-for-key': 'error',
      'vue/no-unused-components': 'warn',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],
    },
  },

  // TypeScript + Vue files configuration
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: parserTypeScript,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },

  // Test files
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/tests/**/*'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Config files
  {
    files: ['**/*.config.{js,ts}', '**/.*rc.{js,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: ['build/**', 'coverage/**', 'dist/**', 'node_modules/**', 'public/**', '**/*.min.js'],
  },
]
