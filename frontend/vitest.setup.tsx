import '@testing-library/jest-dom'
import type { ComponentProps, ReactNode } from 'react'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: ComponentProps<'div'> & { children?: ReactNode }) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: ComponentProps<'header'> & { children?: ReactNode }) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }: ComponentProps<'nav'> & { children?: ReactNode }) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>
}))

// Mock window.matchMedia for sonner
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock lucide-react icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('lucide-react')

  return new Proxy(actual, {
    get: (target, prop: string | symbol) => {
      if (typeof prop === 'string' && (prop.endsWith('Icon') || /^[A-Z]/.test(prop))) {
        const IconMock = (props: ComponentProps<'div'>) => (
          <div data-testid={`icon-${prop.toLowerCase()}`} {...props} />
        )
        IconMock.displayName = `${prop}Mock`
        return IconMock
      }
      return target[prop as keyof typeof target]
    },
  })
})
