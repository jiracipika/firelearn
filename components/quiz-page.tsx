'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  makeStyles,
  tokens,
  mergeClasses,
  Title2,
  Title1,
  Subtitle1,
  Subtitle2,
  Body1,
  Caption1,
  Button,
  Card,
  Badge,
  ProgressBar,
  Field,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components'
import {
  CheckmarkCircle20Filled,
  DismissCircle20Filled,
  ArrowRight20Regular,
  ArrowClockwise20Regular,
  Trophy32Regular,
} from '@fluentui/react-icons'
import { AppShell } from '@/components/app-shell'
import { quiz } from '@/lib/mock-data'
import { useAuth } from '@/components/auth-provider'
import { saveQuizAttempt } from '@/lib/progress'

const QUIZ_ID = 'fire-behavior-check'

const useStyles = makeStyles({
  wrap: {
    maxWidth: '720px',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  head: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  card: {
    paddingTop: tokens.spacingVerticalXL,
    paddingBottom: tokens.spacingVerticalXL,
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    textAlign: 'left',
    width: '100%',
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusLarge,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300,
    cursor: 'pointer',
    transitionDuration: tokens.durationFast,
    transitionProperty: 'background-color, border-color',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
    },
    ':disabled': {
      cursor: 'default',
    },
  },
  optionCorrect: {
    borderTopColor: tokens.colorStatusSuccessBorder1,
    borderRightColor: tokens.colorStatusSuccessBorder1,
    borderBottomColor: tokens.colorStatusSuccessBorder1,
    borderLeftColor: tokens.colorStatusSuccessBorder1,
    backgroundColor: tokens.colorStatusSuccessBackground1,
    color: tokens.colorStatusSuccessForeground1,
  },
  optionWrong: {
    borderTopColor: tokens.colorStatusDangerBorder1,
    borderRightColor: tokens.colorStatusDangerBorder1,
    borderBottomColor: tokens.colorStatusDangerBorder1,
    borderLeftColor: tokens.colorStatusDangerBorder1,
    backgroundColor: tokens.colorStatusDangerBackground1,
    color: tokens.colorStatusDangerForeground1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalM,
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalM,
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
  },
  scoreRing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '96px',
    height: '96px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  scoreValue: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  resultActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
})

export function QuizPage() {
  const styles = useStyles()
  const { user } = useAuth()
  const total = quiz.questions.length
  const [index, setIndex] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [answered, setAnswered] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [finished, setFinished] = React.useState(false)
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved' | 'signed-out'>('idle')
  const savedRef = React.useRef(false)

  const q = quiz.questions[index]
  const isCorrect = selected === q?.correctIndex

  React.useEffect(() => {
    if (!finished || savedRef.current) return
    savedRef.current = true
    if (!user) {
      setSaveState('signed-out')
      return
    }
    setSaveState('saving')
    const pct = Math.round((score / total) * 100)
    saveQuizAttempt({
      quizId: QUIZ_ID,
      quizTitle: quiz.title,
      score: pct,
      totalQuestions: total,
    }).then(({ error }) => {
      setSaveState(error ? 'idle' : 'saved')
    })
  }, [finished, user, score, total])

  const choose = (i: number) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === q.correctIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= total) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setAnswered(false)
  }

  const restart = () => {
    setIndex(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setFinished(false)
    setSaveState('idle')
    savedRef.current = false
  }

  if (finished) {
    const pct = Math.round((score / total) * 100)
    const passed = pct >= 70
    return (
      <AppShell>
        <div className={styles.wrap}>
          <Card>
            <div className={styles.result}>
              <span className={styles.scoreRing}>
                <Trophy32Regular />
              </span>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                {quiz.title}
              </Caption1>
              <Title1>
                <span className={styles.scoreValue}>{pct}%</span>
              </Title1>
              <Subtitle2>
                You answered {score} of {total} correctly
              </Subtitle2>
              <Body1 style={{ color: tokens.colorNeutralForeground2, maxWidth: '420px' }}>
                {passed
                  ? 'Solid work. You have a strong grasp of the material — keep the streak alive.'
                  : 'Close. Review the lesson and run the deck again to lock it in before retesting.'}
              </Body1>
              {saveState === 'saved' && (
                <Caption1 style={{ color: tokens.colorStatusSuccessForeground1 }}>
                  Score saved to your progress
                </Caption1>
              )}
              {saveState === 'signed-out' && (
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                  Sign in to save this score to your progress
                </Caption1>
              )}
              <div className={styles.resultActions}>
                <Button appearance="primary" icon={<ArrowClockwise20Regular />} onClick={restart}>
                  Retake quiz
                </Button>
                <Link href="/flashcards" style={{ textDecoration: 'none' }}>
                  <Button appearance="secondary">Review flashcards</Button>
                </Link>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <Button appearance="subtle">Back to dashboard</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <Badge appearance="tint" color="brand">
            {quiz.title}
          </Badge>
          <Title2 as="h1">Knowledge check</Title2>
        </div>

        <div className={styles.progressRow}>
          <ProgressBar value={(index + (answered ? 1 : 0)) / total} thickness="large" />
          <Caption1 style={{ whiteSpace: 'nowrap', color: tokens.colorNeutralForeground3 }}>
            {index + 1} / {total}
          </Caption1>
        </div>

        <Card className={styles.card}>
          <Subtitle1>{q.prompt}</Subtitle1>
          <div className={styles.options}>
            {q.options.map((opt, i) => {
              const showCorrect = answered && i === q.correctIndex
              const showWrong = answered && i === selected && i !== q.correctIndex
              return (
                <button
                  key={opt}
                  type="button"
                  className={mergeClasses(
                    styles.option,
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionWrong,
                  )}
                  onClick={() => choose(i)}
                  disabled={answered}
                  aria-pressed={selected === i}
                >
                  <span>{opt}</span>
                  {showCorrect && <CheckmarkCircle20Filled />}
                  {showWrong && <DismissCircle20Filled />}
                </button>
              )
            })}
          </div>

          {answered && (
            <MessageBar intent={isCorrect ? 'success' : 'error'}>
              <MessageBarBody>
                <MessageBarTitle>{isCorrect ? 'Correct' : 'Not quite'}</MessageBarTitle>
                {q.explanation}
              </MessageBarBody>
            </MessageBar>
          )}

          <div className={styles.footer}>
            <Button
              appearance="primary"
              disabled={!answered}
              icon={<ArrowRight20Regular />}
              iconPosition="after"
              onClick={next}
            >
              {index + 1 >= total ? 'See results' : 'Next question'}
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
