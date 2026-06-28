'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  CardFooter,
  Subtitle2,
  Caption1,
  Body1,
  Badge,
  Button,
  Field,
  ProgressBar,
} from '@fluentui/react-components'
import {
  Clock20Regular,
  BookOpen20Regular,
  ArrowRight16Regular,
} from '@fluentui/react-icons'
import type { Course, Difficulty } from '@/lib/mock-data'

const useStyles = makeStyles({
  card: {
    height: '100%',
  },
  body: {
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    flexGrow: 1,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    color: tokens.colorNeutralForeground3,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  desc: {
    color: tokens.colorNeutralForeground2,
    flexGrow: 1,
  },
})

const difficultyColor: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'danger',
}

export function CourseCard({ course }: { course: Course }) {
  const styles = useStyles()
  const complete = course.progress >= 1
  const started = course.progress > 0

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Subtitle2>{course.title}</Subtitle2>}
        description={
          <Badge appearance="tint" color={difficultyColor[course.difficulty]}>
            {course.difficulty}
          </Badge>
        }
      />
      <div className={styles.body}>
        <Body1 className={styles.desc}>{course.description}</Body1>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Clock20Regular />
            <Caption1>{course.estimatedTime}</Caption1>
          </span>
          <span className={styles.metaItem}>
            <BookOpen20Regular />
            <Caption1>{course.lessonsCount} lessons</Caption1>
          </span>
        </div>
        <Field
          validationState={complete ? 'success' : 'none'}
          hint={
            complete
              ? 'Completed'
              : started
                ? `${Math.round(course.progress * 100)}% complete`
                : 'Not started'
          }
        >
          <ProgressBar
            value={course.progress}
            thickness="large"
            color={complete ? 'success' : 'brand'}
          />
        </Field>
      </div>
      <CardFooter>
        <Link href="/lesson" style={{ textDecoration: 'none', width: '100%' }}>
          <Button
            appearance={started && !complete ? 'primary' : 'secondary'}
            icon={<ArrowRight16Regular />}
            iconPosition="after"
            style={{ width: '100%' }}
          >
            {complete ? 'Review' : started ? 'Continue' : 'Start course'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
