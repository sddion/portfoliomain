import nextjs from '@next/eslint-plugin-next'
import react from 'eslint-plugin-react'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
  {
    // Base configuration for all files
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextjs,
      'react': react,
      '@typescript-eslint': tseslint
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react/no-unescaped-entities': 'error',
      // Base import restrictions for security
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'fs', message: 'Do not import Node server modules in client code.' },
            { name: 'path', message: 'Do not import Node server modules in client code.' },
            { name: 'child_process', message: 'Do not import server-only modules in client code.' },
            { name: 'crypto', message: 'Use Web Crypto or call an API route.' }
          ]
        }
      ]
    },
    ignores: ['src/js/**/*.min.js', 'src/js/**/*.js']
  },
  {
    // Client-side code specific rules
    files: ['components/**/*.{ts,tsx}', 'app/**/page.{ts,tsx}', 'app/**/client/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'next/server', message: 'Do not use next/server in client components.' }],
          patterns: ['@/app/api/*', '@/lib/server/*', 'server-only', 'fs', 'path', 'child_process', 'crypto']
        }
      ]
    }
  }
]