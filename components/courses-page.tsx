'use client'

import * as React from 'react'
import {
  makeStyles,
  tokens,
  Title2,
  Subtitle1,
  Subtitle2,
  Body1,
  Caption1,
  Input,
  TabList,
  Tab,
  type SelectTabData,
  type SelectTabEvent,
} from '@fluentui/react-components'
import { Search20Regular } from '@fluentui/react-icons'
import { AppShell } from '@/components/app-shell'
import { CourseCard } from '@/components/course-card'
import { topics } from '@/lib/mock-data'
import { useCoursesWithProgress } from '@/components/use-courses-with-progress'

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
  },
  head: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  search: {
    minWidth: '240px',
    maxWidth: '320px',
    flexGrow: 1,
  },
  tabs: {
    flexWrap: 'wrap',
  },
  topicGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  topicHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  empty: {
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
})

export function CoursesPage() {
  const styles = useStyles()
  const courses = useCoursesWithProgress()
  const [topicFilter, setTopicFilter] = React.useState<string>('all')
  const [query, setQuery] = React.useState('')

  const onTabSelect = (_e: SelectTabEvent, data: SelectTabData) => {
    setTopicFilter(data.value as string)
  }

  const visibleTopics = topics.filter(
    (t) => topicFilter === 'all' || t.id === topicFilter,
  )

  const matches = (text: string) =>
    text.toLowerCase().includes(query.trim().toLowerCase())

  return (
    <AppShell>
      <div className={styles.stack}>
        <div className={styles.head}>
          <Title2 as="h1">Course catalog</Title2>
          <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
            Browse every discipline on the fireground. Filter by topic or search
            for a specific skill.
          </Body1>
        </div>

        <div className={styles.controls}>
          <TabList
            className={styles.tabs}
            selectedValue={topicFilter}
            onTabSelect={onTabSelect}
            size="medium"
          >
            <Tab value="all">All</Tab>
            {topics.map((t) => (
              <Tab key={t.id} value={t.id}>
                {t.name}
              </Tab>
            ))}
          </TabList>
          <Input
            className={styles.search}
            value={query}
            onChange={(_e, data) => setQuery(data.value)}
            placeholder="Search courses"
            contentBefore={<Search20Regular />}
            aria-label="Search courses"
          />
        </div>

        {visibleTopics.map((topic) => {
          const topicCourses = courses.filter(
            (c) =>
              c.topic === topic.id &&
              (matches(c.title) || matches(c.description)),
          )
          if (topicCourses.length === 0) return null
          return (
            <section key={topic.id} className={styles.topicGroup}>
              <div className={styles.topicHead}>
                <Subtitle1 as="h2">{topic.name}</Subtitle1>
                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                  {topic.blurb}
                </Caption1>
              </div>
              <div className={styles.grid}>
                {topicCourses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </section>
          )
        })}

        {courses.filter(
          (c) =>
            (topicFilter === 'all' || c.topic === topicFilter) &&
            (matches(c.title) || matches(c.description)),
        ).length === 0 && (
          <div className={styles.empty}>
            <Subtitle2>No courses match your search</Subtitle2>
          </div>
        )}
      </div>
    </AppShell>
  )
}
