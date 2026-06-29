'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  makeStyles,
  tokens,
  mergeClasses,
  Body1,
  Caption1,
  Subtitle2,
  ToggleButton,
  Tooltip,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Spinner,
} from '@fluentui/react-components'
import {
  Fire24Filled,
  WeatherSunny24Regular,
  WeatherMoon24Regular,
  Navigation24Regular,
  Person24Regular,
  SignOut20Regular,
} from '@fluentui/react-icons'
import { useThemeMode } from '@/app/providers'
import { useAuth } from '@/components/auth-provider'
import { AuthDialog } from '@/components/auth-dialog'

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backdropFilter: 'saturate(140%) blur(8px)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    textDecoration: 'none',
    color: tokens.colorNeutralForeground1,
  },
  brandMark: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground}, ${tokens.colorPaletteYellowBackground3})`,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  brandText: {
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '-0.01em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    '@media (max-width: 720px)': {
      display: 'none',
    },
  },
  navLink: {
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalSNudge,
    paddingBottom: tokens.spacingVerticalSNudge,
    borderRadius: tokens.borderRadiusMedium,
    textDecoration: 'none',
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    transitionDuration: tokens.durationFast,
    transitionProperty: 'background-color, color',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
    },
  },
  navLinkActive: {
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  menuButton: {
    '@media (min-width: 721px)': {
      display: 'none',
    },
  },
  main: {
    flexGrow: 1,
    width: '100%',
  },
  inner: {
    maxWidth: '1160px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXXL,
    '@media (max-width: 520px)': {
      paddingLeft: tokens.spacingHorizontalL,
      paddingRight: tokens.spacingHorizontalL,
    },
  },
  footer: {
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground3,
  },
})

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/courses', label: 'Courses' },
  { href: '/quiz', label: 'Quizzes' },
  { href: '/flashcards', label: 'Flashcards' },
  { href: '/profile', label: 'Progress' },
]

function AuthControl() {
  const { user, loading, signOut } = useAuth()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  if (loading && !user) {
    return <Spinner size="tiny" aria-label="Loading account" />
  }

  if (!user) {
    return (
      <>
        <Button
          appearance="primary"
          icon={<Person24Regular />}
          onClick={() => setDialogOpen(true)}
        >
          Sign in
        </Button>
        <AuthDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          defaultMode="sign-in"
        />
      </>
    )
  }

  const label = user.email ?? 'Firefighter'

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button appearance="subtle" aria-label="Account menu">
          <Avatar
            name={label}
            size={28}
            color="brand"
            icon={<Person24Regular />}
            aria-hidden
          />
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem disabled>{user.email ?? 'Signed in'}</MenuItem>
          <MenuDivider />
          <MenuItem icon={<SignOut20Regular />} onClick={() => void signOut()}>
            Sign out
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

export function AppShell({
  children,
  fullBleed = false,
}: {
  children: React.ReactNode
  fullBleed?: boolean
}) {
  const styles = useStyles()
  const { mode, setMode } = useThemeMode()
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="FireLearn home">
          <span className={styles.brandMark}>
            <Fire24Filled />
          </span>
          <Subtitle2 className={styles.brandText}>FireLearn</Subtitle2>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={mergeClasses(
                styles.navLink,
                isActive(item.href) && styles.navLinkActive,
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <AuthControl />

          <Tooltip
            content={mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            relationship="label"
          >
            <ToggleButton
              checked={mode === 'dark'}
              onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
              icon={mode === 'light' ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />}
              appearance="subtle"
              aria-label="Toggle dark theme"
            />
          </Tooltip>

          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                className={styles.menuButton}
                appearance="subtle"
                icon={<Navigation24Regular />}
                aria-label="Open navigation menu"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {navItems.map((item) => (
                  <MenuItem key={item.href}>
                    <Link
                      href={item.href}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {item.label}
                    </Link>
                  </MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </header>

      <main className={styles.main}>
        {fullBleed ? children : <div className={styles.inner}>{children}</div>}
      </main>

      <footer className={styles.footer}>
        <Caption1>FireLearn · Train smarter for the fireground</Caption1>
        <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 }}>
          Demo data for training purposes only.
        </Body1>
      </footer>
    </div>
  )
}
