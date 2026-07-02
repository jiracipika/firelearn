export type WeeklyStudyInsightInput = {
  weeklyMinutes: number[]
  dailyGoalMinutes: number
  streakDays: number
}

export type WeeklyStudyInsight = {
  title: string
  summary: string
  metricLabel: string
  metricValue: string
  status: 'start' | 'catch-up' | 'on-track' | 'strong'
}

function minutesLabel(minutes: number) {
  return `${minutes} min`
}

export function getWeeklyStudyInsight({ weeklyMinutes, dailyGoalMinutes, streakDays }: WeeklyStudyInsightInput): WeeklyStudyInsight {
  const todayMinutes = Math.max(0, Math.round(weeklyMinutes.at(-1) ?? 0))
  const goal = Math.max(0, Math.round(dailyGoalMinutes))
  const totalMinutes = weeklyMinutes.reduce((sum, value) => sum + Math.max(0, Math.round(value)), 0)
  const activeDays = weeklyMinutes.filter((value) => value > 0).length
  const goalHits = goal === 0 ? 0 : weeklyMinutes.filter((value) => value >= goal).length
  const remainingToday = Math.max(0, goal - todayMinutes)

  if (totalMinutes === 0) {
    return {
      title: 'Start today with one focused rep',
      summary: 'Log a short lesson, quiz, or timer session to begin a defensible study streak.',
      metricLabel: 'suggested first rep',
      metricValue: minutesLabel(goal > 0 ? Math.min(goal, 10) : 10),
      status: 'start',
    }
  }

  if (remainingToday > 0) {
    return {
      title: 'Close today\'s readiness gap',
      summary: `${remainingToday} more minute${remainingToday === 1 ? '' : 's'} will keep the daily goal on track after ${activeDays} active day${activeDays === 1 ? '' : 's'} this week.`,
      metricLabel: 'left today',
      metricValue: minutesLabel(remainingToday),
      status: 'catch-up',
    }
  }

  if (goalHits >= 5 || streakDays >= 5) {
    return {
      title: 'Strong weekly consistency',
      summary: `You have ${goalHits} goal hit${goalHits === 1 ? '' : 's'} and a ${streakDays}-day streak. Keep the next rep light and targeted.`,
      metricLabel: 'weekly total',
      metricValue: minutesLabel(totalMinutes),
      status: 'strong',
    }
  }

  return {
    title: 'Daily goal secured',
    summary: `Today is logged. Add a short weak-topic quiz if you want extra readiness without breaking rhythm.`,
    metricLabel: 'active days',
    metricValue: `${activeDays}/7`,
    status: 'on-track',
  }
}
