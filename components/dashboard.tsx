'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  makeStyles,
  tokens,
  Title3,
  Subtitle1,
  Subtitle2,
  Body1,
  Body1Strong,
  Caption1,
  Card,
  Button,
  Avatar,
  Badge,
  Field,
  ProgressBar,
  Divider,
} from '@fluentui/react-components'
import {
  Fire24Filled,
  ArrowRight16Regular,
  Flash24Regular,
  Layer24Regular,
  Trophy24Regular,
  BookOpen24Regular,
  PlayCircle24Regular,
} from '@fluentui/react-icons'
import { AppShell } from '@/components/app-shell'
import { CourseCard } from '@/components/course-card'
import { profile, currentLesson } from '@/lib/mock-data'
import { useCoursesWithProgress } from '@/components/use-courses-with-progress'

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  welcome: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusXLarge,
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
    backgroundImage: `linear-gradient(135deg, ${tokens.colorNeutralBackground1}, ${tokens.colorNeutralBackground3})`,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    flexWrap: 'wrap',
  },
  welcomeLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
  },
  welcomeCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  streakPill: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  continueCard: {
    overflow: 'hidden',
  },
  continueInner: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
  },
  thumb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '120px',
    height: '88px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground}, ${tokens.colorPaletteYellowBackground3})`,
    color: tokens.colorNeutralForegroundOnBrand,
    flexShrink: 0,
  },
  continueCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    flexGrow: 1,
    minWidth: '220px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
  },
  statTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    lineHeight: '1',
  },
  statIcon: {
    color: tokens.colorBrandForeground1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
})

export function Dashboard() {
  const styles = useStyles()
  const courses = useCoursesWithProgress()
  const overallProgress = profile.lessonsCompleted / profile.lessonsTotal
  const recommended = courses.filter((c) => c.progress === 0).slice(0, 3)
  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 1).slice(0, 3)

  return (
    <AppShell>
      <div className={styles.stack}>
        <section className={styles.welcome}>
          <div className={styles.welcomeLeft}>
            <Avatar
              name={profile.name}
              size={64}
              color="brand"
              aria-hidden
            />
            <div className={styles.welcomeCopy}>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                Welcome back
              </Caption1>
              <Title3>{profile.name}</Title3>
              <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
                {profile.station}
              </Body1>
            </div>
          </div>
          <div className={styles.streakPill}>
            <Fire24Filled />
            <Body1Strong style={{ color: 'inherit' }}>
              {profile.streakDays}-day streak
            </Body1Strong>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <Subtitle1 as="h2">Continue learning</Subtitle1>
            <Link href="/courses" style={{ textDecoration: 'none' }}>
              <Button appearance="transparent" icon={<ArrowRight16Regular />} iconPosition="after">
                All courses
              </Button>
            </Link>
          </div>
          <Card className={styles.continueCard}>
            <div className={styles.continueInner}>
              <div className={styles.thumb}>
                <PlayCircle24Regular fontSize={40} />
              </div>
              <div className={styles.continueCopy}>
                <Badge appearance="tint" color="brand">
                  {currentLesson.courseTitle}
                </Badge>
                <Subtitle2>{currentLesson.title}</Subtitle2>
                <Field hint="Lesson 3 of 8 · 62% through this course">
                  <ProgressBar value={0.62} thickness="large" />
                </Field>
              </div>
              <Link href="/lesson" style={{ textDecoration: 'none' }}>
                <Button appearance="primary" size="large" icon={<PlayCircle24Regular />}>
                  Resume
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        <section className={styles.section}>
          <Subtitle1 as="h2">Progress overview</Subtitle1>
          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <div className={styles.statTop}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Lessons done</Caption1>
                <BookOpen24Regular className={styles.statIcon} />
              </div>
              <span className={styles.statValue}>{profile.lessonsCompleted}</span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                of {profile.lessonsTotal} total
              </Caption1>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statTop}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Hours trained</Caption1>
                <Flash24Regular className={styles.statIcon} />
              </div>
              <span className={styles.statValue}>{profile.hoursTrained}</span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>this quarter</Caption1>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statTop}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Saved decks</Caption1>
                <Layer24Regular className={styles.statIcon} />
              </div>
              <span className={styles.statValue}>{profile.savedDecks.length}</span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>flashcard decks</Caption1>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statTop}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Avg. quiz score</Caption1>
                <Trophy24Regular className={styles.statIcon} />
              </div>
              <span className={styles.statValue}>
                {Math.round(
                  profile.quizScores.reduce((a, s) => a + s.score, 0) /
                    profile.quizScores.length,
                )}
                %
              </span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                across {profile.quizScores.length} quizzes
              </Caption1>
            </Card>
          </div>
          <Card className={styles.statCard}>
            <Field
              label={<Body1Strong>Overall completion</Body1Strong>}
              hint={`${Math.round(overallProgress * 100)}% of the FireLearn catalog completed`}
            >
              <ProgressBar value={overallProgress} thickness="large" />
            </Field>
          </Card>
        </section>

        {inProgress.length > 0 && (
          <section className={styles.section}>
            <Subtitle1 as="h2">Pick up where you left off</Subtitle1>
            <div className={styles.grid}>
              {inProgress.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </section>
        )}

        <Divider />

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <Subtitle1 as="h2">Recommended for you</Subtitle1>
            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
              Based on your station&apos;s training plan
            </Caption1>
          </div>
          <div className={styles.grid}>
            {recommended.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
