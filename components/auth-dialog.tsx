'use client'

import * as React from 'react'
import {
  makeStyles,
  tokens,
  mergeClasses,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Field,
  Input,
  Title3,
  Subtitle2,
  Body1,
  Body1Strong,
  Caption1,
  Spinner,
  MessageBar,
  MessageBarBody,
  Tab,
  TabList,
  type SelectTabData,
} from '@fluentui/react-components'
import {
  Fire24Filled,
  Mail24Regular,
  Eye20Regular,
  EyeOff20Regular,
  LockClosed20Regular,
  MailCheckmark24Regular,
  ArrowRight20Regular,
  PersonAdd24Regular,
  Dismiss24Regular,
} from '@fluentui/react-icons'
import { useAuth } from '@/components/auth-provider'

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  surface: {
    maxWidth: '420px',
    width: '100%',
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
    borderRadius: tokens.borderRadiusXLarge,
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalL,
  },
  brandMark: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground}, ${tokens.colorPaletteYellowBackground3})`,
    color: tokens.colorNeutralForegroundOnBrand,
    flexShrink: 0,
  },
  tabs: {
    marginBottom: tokens.spacingVerticalL,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  passwordWrap: {
    position: 'relative',
  },
  submitBtn: {
    width: '100%',
    marginTop: tokens.spacingVerticalS,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground3,
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  switchRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalS,
  },
  // Verification screen
  verifyWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalM,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
  },
  verifyIconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground2}, ${tokens.colorBrandBackground})`,
    color: tokens.colorNeutralForegroundOnBrand,
    marginBottom: tokens.spacingVerticalS,
  },
  verifyEmail: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  verifyHint: {
    color: tokens.colorNeutralForeground3,
    maxWidth: '320px',
  },
  verifySteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalS,
  },
  verifyStep: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground2,
  },
  stepNum: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightBold,
    flexShrink: 0,
  },
  closeBtn: {
    position: 'absolute',
    top: tokens.spacingVerticalM,
    right: tokens.spacingHorizontalM,
  },
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuthMode = 'sign-in' | 'sign-up'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = 'sign-in',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: AuthMode
}) {
  const styles = useStyles()
  const { signInWithEmail, signUpWithEmail } = useAuth()

  const [mode, setMode] = React.useState<AuthMode>(defaultMode)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [verifying, setVerifying] = React.useState(false)

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setEmail('')
      setPassword('')
      setError(null)
      setVerifying(false)
      setLoading(false)
    } else {
      setMode(defaultMode)
    }
  }, [open, defaultMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'sign-up') {
      const { error: err } = await signUpWithEmail(email, password)
      if (err) {
        setError(err)
      } else {
        setVerifying(true)
      }
    } else {
      const { error: err } = await signInWithEmail(email, password)
      if (err) {
        setError(err)
      } else {
        onOpenChange(false)
      }
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!loading) onOpenChange(data.open)
      }}
    >
      <DialogSurface className={styles.surface}>
        <Button
          className={styles.closeBtn}
          appearance="subtle"
          icon={<Dismiss24Regular />}
          aria-label="Close"
          onClick={() => onOpenChange(false)}
        />

        <DialogBody>
          <DialogTitle
            action={null}
            style={{ paddingRight: 0, paddingBottom: 0 }}
          >
            {verifying ? null : (
              <div className={styles.brand}>
                <span className={styles.brandMark} aria-hidden>
                  <Fire24Filled fontSize={22} />
                </span>
                <Subtitle2>FireLearn</Subtitle2>
              </div>
            )}
          </DialogTitle>

          <DialogContent>
            {verifying ? (
              <VerificationScreen email={email} styles={styles} />
            ) : (
              <>
                <Title3 style={{ marginBottom: tokens.spacingVerticalXS }}>
                  {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
                </Title3>
                <Body1 style={{ color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalL, display: 'block' }}>
                  {mode === 'sign-in'
                    ? 'Sign in to track your training progress'
                    : 'Join FireLearn and start building fire knowledge'}
                </Body1>

                <TabList
                  className={styles.tabs}
                  selectedValue={mode}
                  onTabSelect={(_e, data: SelectTabData) => {
                    setMode(data.value as AuthMode)
                    setError(null)
                  }}
                >
                  <Tab value="sign-in">Sign in</Tab>
                  <Tab value="sign-up">Create account</Tab>
                </TabList>

                {error && (
                  <MessageBar intent="error" style={{ marginBottom: tokens.spacingVerticalM }}>
                    <MessageBarBody>{error}</MessageBarBody>
                  </MessageBar>
                )}

                <form onSubmit={(e) => void handleSubmit(e)} className={styles.form}>
                  <Field
                    label="Email address"
                    required
                    validationState={error ? 'error' : 'none'}
                  >
                    <Input
                      type="email"
                      placeholder="you@firestation.gov"
                      value={email}
                      onChange={(_e, data) => setEmail(data.value)}
                      contentBefore={<Mail24Regular />}
                      autoComplete="email"
                      autoFocus
                      required
                    />
                  </Field>

                  <Field
                    label="Password"
                    required
                    hint={mode === 'sign-up' ? 'Minimum 8 characters' : undefined}
                  >
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'sign-up' ? 'Create a strong password' : 'Enter your password'}
                      value={password}
                      onChange={(_e, data) => setPassword(data.value)}
                      contentBefore={<LockClosed20Regular />}
                      contentAfter={
                        <Button
                          appearance="transparent"
                          size="small"
                          icon={showPassword ? <EyeOff20Regular /> : <Eye20Regular />}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((s) => !s)}
                          type="button"
                        />
                      }
                      autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                      required
                    />
                  </Field>

                  <Button
                    type="submit"
                    appearance="primary"
                    className={styles.submitBtn}
                    disabled={loading || !email || !password}
                    icon={loading ? <Spinner size="tiny" /> : mode === 'sign-in' ? <ArrowRight20Regular /> : <PersonAdd24Regular />}
                    iconPosition="after"
                  >
                    {loading
                      ? mode === 'sign-in' ? 'Signing in…' : 'Creating account…'
                      : mode === 'sign-in' ? 'Sign in' : 'Create account'}
                  </Button>
                </form>

                <div className={styles.switchRow}>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                    {mode === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}
                  </Caption1>
                  <Button
                    appearance="transparent"
                    size="small"
                    onClick={() => {
                      setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
                      setError(null)
                    }}
                  >
                    {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>

          {verifying && (
            <DialogActions style={{ justifyContent: 'center' }}>
              <Button
                appearance="subtle"
                onClick={() => {
                  setVerifying(false)
                  setPassword('')
                }}
              >
                Use a different email
              </Button>
              <Button appearance="primary" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogActions>
          )}
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Verification screen
// ---------------------------------------------------------------------------

function VerificationScreen({
  email,
  styles,
}: {
  email: string
  styles: ReturnType<typeof useStyles>
}) {
  return (
    <div className={styles.verifyWrap}>
      <div className={styles.verifyIconWrap} aria-hidden>
        <MailCheckmark24Regular fontSize={40} />
      </div>

      <div>
        <Title3 style={{ marginBottom: tokens.spacingVerticalXS }}>
          Check your inbox
        </Title3>
        <Body1 className={styles.verifyHint} as="p">
          We sent a verification link to
        </Body1>
        <Body1Strong className={styles.verifyEmail}>{email}</Body1Strong>
      </div>

      <div className={styles.verifySteps}>
        {[
          'Open the email from FireLearn',
          'Click the "Confirm your email" link',
          'You\'ll be signed in automatically',
        ].map((step, i) => (
          <div key={i} className={styles.verifyStep}>
            <span className={styles.stepNum}>{i + 1}</span>
            <Caption1>{step}</Caption1>
          </div>
        ))}
      </div>

      <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
        Didn&apos;t receive it? Check your spam folder or try a different email address.
      </Caption1>
    </div>
  )
}
