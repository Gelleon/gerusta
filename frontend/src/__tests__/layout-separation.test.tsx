import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PublicLayout from '@/app/(public)/layout'
import AdminLayout from '@/app/admin/layout'
import { usePathname } from 'next/navigation'

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru', changeLanguage: vi.fn() }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  }
}))

// Mock Auth Store
vi.mock('@/store/auth-store', () => ({
  useAuthStore: () => ({
    user: { name: 'Admin', role: 'ADMIN' },
    isAuthenticated: true,
    logout: vi.fn()
  })
}))

describe('Layout Separation (Anti-Flicker)', () => {
  it('PublicLayout includes Header', () => {
    render(
      <PublicLayout>
        <div data-testid="public-content">Public Content</div>
      </PublicLayout>
    )
    
    // Header contains "GERUSTA" logo text
    expect(screen.getByText(/GERUSTA/i)).toBeInTheDocument()
    expect(screen.getByTestId('public-content')).toBeInTheDocument()
  })

  it('AdminLayout does NOT include public Header', () => {
    // Mock pathname to be in admin
    vi.mocked(usePathname).mockReturnValue('/admin')
    
    render(
      <AdminLayout>
        <div data-testid="admin-content">Admin Content</div>
      </AdminLayout>
    )
    
    // Public Header "GERUSTA" should NOT be present
    // Note: Admin layout has its own "Gerusta" text, but the public Header has a specific bot icon or link structure
    // We check for the absence of public nav links
    expect(screen.queryByText('Услуги')).not.toBeInTheDocument()
    expect(screen.queryByText('Кейсы')).not.toBeInTheDocument()
    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
  })
})
