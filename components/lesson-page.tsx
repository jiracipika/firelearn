'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  makeStyles,
  tokens,
  Title2,
  Subtitle1,
  Subtitle2,
  Body1,
  Caption1,
  Button,
  Card,
  Badge,
  Divider,
  ProgressBar,
  Field,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbButton,
  BreadcrumbDivider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components'
import {
  PlayCircle48Filled,
  CheckmarkCircle20Filled,
  CheckmarkCircle20Regular,
  ArrowRight20Regular,
  Clock20Regular,
  Flash20Regular,
} from '@fluentui/react-icons'
import { AppShell } from '@/components/app-shell'
import { currentLesson } from '@/lib/mock-data'
import { useAuth } from '@/components/auth-provider'
import { saveCourseProgress } from '@/lib/progress'

// Lesson 3 of 8 in this course
const LESSON_NUMBER = 3
const COURSE_LESSON_TOTAL = 8

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 320px',
    gap: tokens.spacingHorizontalXL,
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  video: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: tokens.borderRadiusXLarge,
    backgroundImage: `radial-gradient(circle at 50% 40%, ${tokens.colorBrandBackground2}, ${tokens.colorNeutralBackground1} 70%)`,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalS,
    color: tokens.colorBrandForeground1,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    flexWrap: 'wrap',
    color: tokens.colorNeutralForeground3,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  prose: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  paragraph: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase500,
  },
  takeawayCard: {
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  takeaway: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
  },
  checkIcon: {
    color: tokens.colorStatusSuccessForeground1,
    flexShrink: 0,
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    paddingTop: tokens.spacingVerticalM,
  },
  side: {
    position: 'sticky',
    top: '84px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
  },
  lessonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalSNudge,
    paddingBottom: tokens.spacingVerticalSNudge,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },
})

const outline = [
  { title: 'The Fire Tetrahedron', state: 'done' },
  { title: 'Stages of Fire Development', state: 'done' },
  { title: 'Recognizing Flashover', state: 'current' },
  { title: 'Backdraft Indicators', state: 'todo' },
]

export function LessonPage() {
  const styles = useStyles()
  const { user } = useAuth()
  const [complete, setComplete] = React.useState(false)
  const [saveNote, setSaveNote] = React.useState<string | null>(null)

  const toggleComplete = async () => {
    const next = !complete
    setComplete(next)
    if (!next) {
      setSaveNote(null)
      return
    }
    if (!user) {
      setSaveNote('Sign in to save your progress')
      return
    }
    const completedLessons = LESSON_NUMBER
    const { error } = await saveCourseProgress({
      courseId: currentLesson.courseId,
      progress: completedLessons / COURSE_LESSON_TOTAL,
      completedLessons,
    })
    setSaveNote(error ? null : 'Progress saved to your account')
  }

  return (
    <AppShell>
      <div className={styles.stack}>
        <Breadcrumb aria-label="Lesson location">
          <BreadcrumbItem>
            <BreadcrumbButton>
              <Link href="/courses" style={{ textDecoration: 'none', color: 'inherit' }}>
                Courses
              </Link>
            </BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton>{currentLesson.courseTitle}</BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton current>{currentLesson.title}</BreadcrumbButton>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className={styles.layout}>
          <div className={styles.main}>
            <div className={styles.video} role="button" tabIndex={0} aria-label="Play lesson video">
              <PlayCircle48Filled />
              <Caption1 style={{ color: tokens.colorBrandForeground1 }}>
                Play lesson video
              </Caption1>
            </div>

            <div>
              <Badge appearance="tint" color="brand">
                {currentLesson.courseTitle}
              </Badge>
              <Title2 as="h1" style={{ marginTop: tokens.spacingVerticalS }}>
                {currentLesson.title}
              </Title2>
              <div className={styles.meta} style={{ marginTop: tokens.spacingVerticalS }}>
                <span className={styles.metaItem}>
                  <Clock20Regular />
                  <Caption1>{currentLesson.duration}</Caption1>
                </span>
                <span className={styles.metaItem}>
                  <Flash20Regular />
                  <Caption1>Lesson 3 of 8</Caption1>
                </span>
              </div>
            </div>

            <Divider />

            <div className={styles.prose}>
              {currentLesson.body.map((p, i) => (
                <Body1 key={i} className={styles.paragraph}>
                  {p}
                </Body1>
              ))}
            </div>

            <Card className={styles.takeawayCard}>
              <Subtitle1>Key takeaways</Subtitle1>
              {currentLesson.takeaways.map((t) => (
                <div key={t} className={styles.takeaway}>
                  <CheckmarkCircle20Filled className={styles.checkIcon} />
                  <Body1 style={{ color: tokens.colorNeutralForeground1 }}>{t}</Body1>
                </div>
              ))}
            </Card>

            {complete && (
              <MessageBar intent={saveNote === 'Sign in to save your progress' ? 'warning' : 'success'}>
                <MessageBarBody>
                  <MessageBarTitle>Lesson complete.</MessageBarTitle>
                  {saveNote ?? 'Nice work — saving your progress…'}
                </MessageBarBody>
              </MessageBar>
            )}

            <div className={styles.actions}>
              <Button
                appearance={complete ? 'secondary' : 'outline'}
                icon={complete ? <CheckmarkCircle20Filled /> : <CheckmarkCircle20Regular />}
                onClick={() => void toggleComplete()}
              >
                {complete ? 'Completed' : 'Mark complete'}
              </Button>
              <Link href="/quiz" style={{ textDecoration: 'none' }}>
                <Button appearance="primary" icon={<ArrowRight20Regular />} iconPosition="after">
                  Next: {currentLesson.nextLessonTitle}
                </Button>
              </Link>
            </div>
          </div>

          <Card className={styles.side}>
            <Subtitle2>Course outline</Subtitle2>
            <Field hint="62% complete">
              <ProgressBar value={0.62} thickness="large" />
            </Field>
            <Divider />
            <div>
              {outline.map((item) => (
                <div key={item.title} className={styles.lessonRow}>
                  <span
                    className={styles.dot}
                    style={{
                      backgroundColor:
                        item.state === 'done'
                          ? tokens.colorStatusSuccessForeground1
                          : item.state === 'current'
                            ? tokens.colorBrandForeground1
                            : tokens.colorNeutralStroke1,
                    }}
                  />
                  <Body1
                    style={{
                      color:
                        item.state === 'current'
                          ? tokens.colorNeutralForeground1
                          : tokens.colorNeutralForeground3,
                      fontWeight:
                        item.state === 'current'
                          ? tokens.fontWeightSemibold
                          : tokens.fontWeightRegular,
                    }}
                  >
                    {item.title}
                  </Body1>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
