'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  makeStyles,
  tokens,
  Title2,
  Title3,
  Subtitle1,
  Subtitle2,
  Body1,
  Body1Strong,
  Caption1,
  Card,
  CardHeader,
  Avatar,
  Badge,
  Button,
  Divider,
  ProgressBar,
  Field,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableBody,
  TableCell,
  TableCellLayout,
} from '@fluentui/react-components'
import {
  Fire24Filled,
  BookOpen24Regular,
  Trophy24Regular,
  Clock24Regular,
  Layer24Regular,
  ArrowRight16Regular,
  CheckmarkCircle16Regular,
} from '@fluentui/react-icons'
import useSWR from 'swr'
import { AppShell } from '@/components/app-shell'
import { profile, topicName, deckById } from '@/lib/mock-data'
import { useAuth } from '@/components/auth-provider'
import { fetchQuizAttempts } from '@/lib/progress'

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    flexWrap: 'wrap',
    paddingTop: tokens.spacingVerticalXL,
    paddingBottom: tokens.spacingVerticalXL,
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    backgroundImage: `linear-gradient(135deg, ${tokens.colorNeutralBackground1}, ${tokens.colorNeutralBackground3})`,
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  heroCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    flexGrow: 1,
    minWidth: '180px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
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
  statIcon: { color: tokens.colorBrandForeground1 },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalL,
    alignItems: 'start',
  },
  panel: {
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  scoreCell: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: '120px',
  },
  deckRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  deckInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
})

function scoreColor(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 85) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}

export function ProfilePage() {
  const styles = useStyles()
  const { user } = useAuth()
  const { data: attempts } = useSWR(
    user ? ['quiz-attempts', user.id] : null,
    fetchQuizAttempts,
  )

  const hasReal = !!user && !!attempts && attempts.length > 0
  const scores = hasReal
    ? attempts!.map((a) => ({
        id: a.id,
        name: a.quiz_title,
        score: a.score,
        date: new Date(a.taken_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
      }))
    : profile.quizScores

  const overall = profile.lessonsCompleted / profile.lessonsTotal
  const avg = scores.length
    ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
    : 0

  return (
    <AppShell>
      <div className={styles.stack}>
        <section className={styles.hero}>
          <Avatar name={profile.name} size={72} color="brand" aria-hidden />
          <div className={styles.heroCopy}>
            <Title3 as="h1">{profile.name}</Title3>
            <Body1 style={{ color: tokens.colorNeutralForeground2 }}>{profile.station}</Body1>
          </div>
          <div className={styles.streakPill}>
            <Fire24Filled />
            <Body1Strong style={{ color: 'inherit' }}>{profile.streakDays}-day streak</Body1Strong>
          </div>
        </section>

        <section className={styles.section}>
          <Subtitle1 as="h2">Your stats</Subtitle1>
          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <div className={styles.statTop}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Lessons completed</Caption1>
                <BookOpen24Regular className={styles.statIcon} />
              </div>
              <span className={styles.statValue}>{profile.lessonsCompleted}</span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                of {profile.lessonsTotal}
              </Caption1>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statTop}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Avg. quiz score</Caption1>
                <Trophy24Regular className={styles.statIcon} />
              </div>
              <span className={styles.statValue}>{avg}%</span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                {scores.length} quizzes taken
              </Caption1>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statTop}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Hours trained</Caption1>
                <Clock24Regular className={styles.statIcon} />
              </div>
              <span className={styles.statValue}>{profile.hoursTrained}</span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>this quarter</Caption1>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statTop}>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>Current streak</Caption1>
                <Fire24Filled className={styles.statIcon} />
              </div>
              <span className={styles.statValue}>{profile.streakDays}</span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>days in a row</Caption1>
            </Card>
          </div>
          <Card className={styles.statCard}>
            <Field
              label={<Body1Strong>Overall completion</Body1Strong>}
              hint={`${Math.round(overall * 100)}% of the FireLearn catalog`}
            >
              <ProgressBar value={overall} thickness="large" />
            </Field>
          </Card>
        </section>

        <section className={styles.twoCol}>
          <Card className={styles.panel}>
            <CardHeader header={<Subtitle2>Recent quiz scores</Subtitle2>} />
            <Table aria-label="Recent quiz scores" size="small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Quiz</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Score</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <TableCellLayout>{s.name}</TableCellLayout>
                    </TableCell>
                    <TableCell>
                      <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{s.date}</Caption1>
                    </TableCell>
                    <TableCell>
                      <div className={styles.scoreCell}>
                        <Badge appearance="tint" color={scoreColor(s.score)}>
                          {s.score}%
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className={styles.panel}>
            <CardHeader
              header={<Subtitle2>Saved flashcard decks</Subtitle2>}
              action={
                <Link href="/flashcards" style={{ textDecoration: 'none' }}>
                  <Button appearance="transparent" icon={<ArrowRight16Regular />} iconPosition="after">
                    Study
                  </Button>
                </Link>
              }
            />
            {profile.savedDecks.map((id, i) => {
              const deck = deckById(id)
              if (!deck) return null
              return (
                <React.Fragment key={id}>
                  {i > 0 && <Divider />}
                  <div className={styles.deckRow}>
                    <div className={styles.deckInfo}>
                      <Avatar
                        icon={<Layer24Regular />}
                        color="brand"
                        shape="square"
                        aria-hidden
                      />
                      <div>
                        <Body1Strong>{deck.name}</Body1Strong>
                        <div>
                          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                            {topicName(deck.topic)} · {deck.cards.length} cards
                          </Caption1>
                        </div>
                      </div>
                    </div>
                    <CheckmarkCircle16Regular style={{ color: tokens.colorStatusSuccessForeground1 }} />
                  </div>
                </React.Fragment>
              )
            })}
          </Card>
        </section>
      </div>
    </AppShell>
  )
}
