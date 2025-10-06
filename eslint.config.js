import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

const ignores = [
  'node_modules/',
  'vendor/',
  'public/',
  'build/',
  'dist/',
  '*.config.js',
  '*.config.cjs',
  '*.config.mjs',
  '*.json',
  '*.php',
  '*.js',
];

export default tseslint.config(
  {
    ignores,
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'prettier/prettier': ['error', { semi: false }],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Permite catch vazio (comum para ignorar localStorage/feature detection)
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  }
);
