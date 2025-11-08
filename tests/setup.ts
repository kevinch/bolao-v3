import '@testing-library/jest-dom'
import { vi } from 'vitest'

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

