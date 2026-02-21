import '@testing-library/jest-dom'
import { vi } from 'vitest'
import en from '../messages/en.json'

// Helper to get nested translation value
function getNestedValue(obj: Record<string, any>, path: string): string {
  const result = path.split('.').reduce((acc, key) => acc?.[key], obj)
  return typeof result === 'string' ? result : path
}

// Mock next-intl (client-side)
vi.mock('next-intl', () => {
  const React = require('react')
  return {
    useTranslations: (namespace?: string) => {
      const t = (key: string) => {
        const fullPath = namespace ? `${namespace}.${key}` : key
        return getNestedValue(en, fullPath)
      }
      t.rich = (key: string, values?: Record<string, any>) => {
        const fullPath = namespace ? `${namespace}.${key}` : key
        return getNestedValue(en, fullPath)
      }
      return t
    },
    useLocale: () => 'en',
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

// Mock next-intl/server (server-side)
vi.mock('next-intl/server', () => {
  return {
    getTranslations: async (namespace?: string) => {
      const t = (key: string) => {
        const fullPath = namespace ? `${namespace}.${key}` : key
        return getNestedValue(en, fullPath)
      }
      t.rich = (key: string, values?: Record<string, any>) => {
        const fullPath = namespace ? `${namespace}.${key}` : key
        return getNestedValue(en, fullPath)
      }
      return t
    },
    getLocale: async () => 'en',
    getMessages: async () => en,
  }
})

// Mock next/link
vi.mock('next/link', () => {
  const React = require('react')
  return {
    default: ({ children, href, ...props }: { children: any; href: string; [key: string]: any }) => {
      return React.createElement('a', { href, ...props }, children)
    },
  }
})

// Mock next/navigation
vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    useSearchParams: () => ({
      get: vi.fn(),
    }),
    usePathname: () => '/',
  }
})

// Mock next/server
vi.mock('next/server', () => {
  return {
    redirect: vi.fn(),
  }
})

