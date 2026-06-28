'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  makeStyles,
  tokens,
  Title1,
  Title3,
  Subtitle1,
  Subtitle2,
  Body1,
  Body1Strong,
  Caption1,
  Button,
  Card,
  Badge,
  Divider,
} from '@fluentui/react-components'
import {
  BookOpen24Regular,
  Flash24Regular,
  Layer24Regular,
  ArrowTrending24Regular,
  ArrowRight20Regular,
  Fire20Filled,
} from '@fluentui/react-icons'
import { AppShell } from '@/components/app-shell'

const useStyles = makeStyles({
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.5,
  },
  heroScrim: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `linear-gradient(180deg, ${tokens.colorNeutralBackground2}CC 0%, ${tokens.colorNeutralBackground2}99 40%, ${tokens.colorNeutralBackground2} 100%)`,
  },
  heroInner: {
    position: 'relative',
    maxWidth: '1160px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    paddingTop: '88px',
    paddingBottom: '96px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    alignItems: 'flex-start',
    '@media (max-width: 520px)': {
      paddingLeft: tokens.spacingHorizontalL,
      paddingRight: tokens.spacingHorizontalL,
      paddingTop: '56px',
      paddingBottom: '64px',
    },
  },
  heroCopy: {
    maxWidth: '680px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  heroTitle: {
    fontSize: tokens.fontSizeHero900,
    lineHeight: tokens.lineHeightHero900,
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '-0.02em',
    '@media (max-width: 520px)': {
      fontSize: tokens.fontSizeHero800,
      lineHeight: tokens.lineHeightHero800,
    },
  },
  accent: {
    backgroundImage: `linear-gradient(120deg, ${tokens.colorBrandForeground1}, ${tokens.colorPaletteYellowForeground2})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  heroActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    marginTop: tokens.spacingVerticalS,
  },
  stats: {
    display: 'flex',
    gap: tokens.spacingHorizontalXXL,
    flexWrap: 'wrap',
    marginTop: tokens.spacingVerticalL,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
    lineHeight: '1',
  },
  section: {
    maxWidth: '1160px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    paddingTop: tokens.spacingVerticalXXXL,
    paddingBottom: tokens.spacingVerticalXXXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    '@media (max-width: 520px)': {
      paddingLeft: tokens.spacingHorizontalL,
      paddingRight: tokens.spacingHorizontalL,
    },
  },
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    maxWidth: '620px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
  },
  iconBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    marginBottom: tokens.spacingVerticalXS,
  },
  cta: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusXLarge,
    paddingTop: tokens.spacingVerticalXXXL,
    paddingBottom: tokens.spacingVerticalXXXL,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackgroundPressed})`,
    color: tokens.colorNeutralForegroundOnBrand,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalM,
  },
})

const features = [
  {
    icon: <BookOpen24Regular />,
    title: 'Lessons',
    body: 'Structured, video-backed lessons with clear key takeaways for every fireground discipline.',
  },
  {
    icon: <Flash24Regular />,
    title: 'Quizzes',
    body: 'Multiple-choice checks with instant feedback so knowledge sticks before the call comes in.',
  },
  {
    icon: <Layer24Regular />,
    title: 'Flashcards',
    body: 'Spaced-repetition decks that drill the terms, tactics, and acronyms you need cold.',
  },
  {
    icon: <ArrowTrending24Regular />,
    title: 'Progress Tracking',
    body: 'Streaks, scores, and completion tracking that keep your crew sharp and accountable.',
  },
]

export function LandingPage() {
  const styles = useStyles()

  return (
    <AppShell fullBleed>
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ backgroundImage: 'url(/hero-fireground.png)' }}
          aria-hidden
        />
        <div className={styles.heroScrim} aria-hidden />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <Badge appearance="tint" color="brand" icon={<Fire20Filled />}>
              Firefighter training, reimagined
            </Badge>
            <Title1 as="h1" className={styles.heroTitle}>
              Train smarter for the{' '}
              <span className={styles.accent}>fireground</span>
            </Title1>
            <Body1 style={{ fontSize: tokens.fontSizeBase400, color: tokens.colorNeutralForeground2 }}>
              FireLearn blends bite-sized lessons, quizzes, and spaced-repetition
              flashcards into one focused platform — so every member of your
              company can build mastery on shift, between calls, or at the kitchen
              table.
            </Body1>
            <div className={styles.heroActions}>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button appearance="primary" size="large" icon={<ArrowRight20Regular />} iconPosition="after">
                  Start Learning
                </Button>
              </Link>
              <Link href="/courses" style={{ textDecoration: 'none' }}>
                <Button appearance="outline" size="large">
                  Browse Courses
                </Button>
              </Link>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>120+</span>
                <Caption1>Lessons</Caption1>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>6</span>
                <Caption1>Core disciplines</Caption1>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>900+</span>
                <Caption1>Flashcards</Caption1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <Subtitle1 as="h2">Everything your company needs to stay sharp</Subtitle1>
          <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
            Four ways to learn, built to fit the rhythm of the firehouse.
          </Body1>
        </div>
        <div className={styles.grid}>
          {features.map((f) => (
            <Card key={f.title} className={styles.featureCard}>
              <span className={styles.iconBadge}>{f.icon}</span>
              <Subtitle2>{f.title}</Subtitle2>
              <Body1 style={{ color: tokens.colorNeutralForeground2 }}>{f.body}</Body1>
            </Card>
          ))}
        </div>

        <Divider style={{ marginTop: tokens.spacingVerticalL, marginBottom: tokens.spacingVerticalL }} />

        <div className={styles.cta}>
          <Title3 style={{ color: 'inherit' }}>Ready to put in the reps?</Title3>
          <Body1Strong style={{ color: 'inherit', maxWidth: '520px' }}>
            Jump into your dashboard and pick up right where you left off — or
            explore the full course catalog.
          </Body1Strong>
          <div className={styles.heroActions}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Button appearance="secondary" size="large" icon={<ArrowRight20Regular />} iconPosition="after">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
