'use client'

import * as React from 'react'
import {
  makeStyles,
  tokens,
  Title2,
  Subtitle1,
  Body1,
  Body1Strong,
  Caption1,
  Button,
  Card,
  Badge,
  Field,
  Dropdown,
  Option,
  ProgressBar,
  type OptionOnSelectData,
} from '@fluentui/react-components'
import {
  ArrowSync20Regular,
  ArrowHookUpLeft20Regular,
  Layer24Regular,
} from '@fluentui/react-icons'
import { AppShell } from '@/components/app-shell'
import { decks, topicName } from '@/lib/mock-data'

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
  controls: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  deckField: {
    minWidth: '260px',
    flexGrow: 1,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  scene: {
    perspective: '1600px',
    height: '320px',
  },
  card3d: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transitionProperty: 'transform',
    transitionDuration: tokens.durationSlow,
    transitionTimingFunction: tokens.curveDecelerateMid,
    transformStyle: 'preserve-3d',
    cursor: 'pointer',
  },
  flipped: {
    transform: 'rotateY(180deg)',
  },
  face: {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: tokens.borderRadiusXLarge,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
  },
  front: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
  back: {
    transform: 'rotateY(180deg)',
    backgroundImage: `linear-gradient(135deg, ${tokens.colorNeutralBackground1}, ${tokens.colorBrandBackground2})`,
  },
  faceLabel: {
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  hint: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
  ratings: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spacingHorizontalS,
    '@media (max-width: 480px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  ratingBtn: {
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
  },
  done: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalM,
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
  },
})

type Rating = { label: string; due: string; color: string }

export function FlashcardsPage() {
  const styles = useStyles()
  const [deckId, setDeckId] = React.useState(decks[0].id)
  const [cardIndex, setCardIndex] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const [reviewed, setReviewed] = React.useState(0)

  const deck = decks.find((d) => d.id === deckId) ?? decks[0]
  const card = deck.cards[cardIndex]
  const finished = cardIndex >= deck.cards.length

  const ratings: Rating[] = [
    { label: 'Again', due: '<1m', color: tokens.colorStatusDangerForeground1 },
    { label: 'Hard', due: '8m', color: tokens.colorPaletteYellowForeground2 },
    { label: 'Good', due: '1d', color: tokens.colorBrandForeground1 },
    { label: 'Easy', due: '4d', color: tokens.colorStatusSuccessForeground1 },
  ]

  const selectDeck = (_e: unknown, data: OptionOnSelectData) => {
    if (!data.optionValue) return
    setDeckId(data.optionValue)
    setCardIndex(0)
    setFlipped(false)
    setReviewed(0)
  }

  const rate = () => {
    setFlipped(false)
    setReviewed((r) => r + 1)
    // brief delay so the flip-back animation reads before content swaps
    window.setTimeout(() => setCardIndex((i) => i + 1), 180)
  }

  const restart = () => {
    setCardIndex(0)
    setFlipped(false)
    setReviewed(0)
  }

  return (
    <AppShell>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <Title2 as="h1">Flashcards</Title2>
          <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
            Flip the card, recall the answer, then rate yourself. FireLearn
            schedules the next review with simple spaced repetition.
          </Body1>
        </div>

        <div className={styles.controls}>
          <Field className={styles.deckField} label="Deck">
            <Dropdown
              value={deck.name}
              selectedOptions={[deck.id]}
              onOptionSelect={selectDeck}
            >
              {decks.map((d) => (
                <Option key={d.id} value={d.id} text={d.name}>
                  {d.name}
                </Option>
              ))}
            </Dropdown>
          </Field>
          <Badge appearance="tint" color="brand" icon={<Layer24Regular />}>
            {topicName(deck.topic)}
          </Badge>
        </div>

        <div className={styles.progressRow}>
          <ProgressBar
            value={Math.min(reviewed / deck.cards.length, 1)}
            thickness="large"
          />
          <Caption1 style={{ whiteSpace: 'nowrap', color: tokens.colorNeutralForeground3 }}>
            {Math.min(reviewed, deck.cards.length)} / {deck.cards.length}
          </Caption1>
        </div>

        {finished ? (
          <Card>
            <div className={styles.done}>
              <Subtitle1>Deck complete</Subtitle1>
              <Body1 style={{ color: tokens.colorNeutralForeground2, maxWidth: '420px' }}>
                You reviewed all {deck.cards.length} cards in{' '}
                <strong>{deck.name}</strong>. Come back tomorrow to keep the
                cards scheduled by spaced repetition fresh.
              </Body1>
              <Button appearance="primary" icon={<ArrowSync20Regular />} onClick={restart}>
                Review again
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className={styles.scene}>
              <div
                className={flipped ? `${styles.card3d} ${styles.flipped}` : styles.card3d}
                onClick={() => setFlipped((f) => !f)}
                role="button"
                tabIndex={0}
                aria-label={flipped ? 'Show question' : 'Reveal answer'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setFlipped((f) => !f)
                  }
                }}
              >
                <div className={`${styles.face} ${styles.front}`}>
                  <Caption1 className={styles.faceLabel}>Question</Caption1>
                  <Subtitle1>{card.front}</Subtitle1>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                    Tap to flip
                  </Caption1>
                </div>
                <div className={`${styles.face} ${styles.back}`}>
                  <Caption1 className={styles.faceLabel}>Answer</Caption1>
                  <Body1Strong style={{ fontSize: tokens.fontSizeBase500 }}>
                    {card.back}
                  </Body1Strong>
                </div>
              </div>
            </div>

            {flipped ? (
              <div className={styles.ratings}>
                {ratings.map((r) => (
                  <Button
                    key={r.label}
                    className={styles.ratingBtn}
                    appearance="outline"
                    onClick={rate}
                  >
                    <Body1Strong style={{ color: r.color }}>{r.label}</Body1Strong>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                      {r.due}
                    </Caption1>
                  </Button>
                ))}
              </div>
            ) : (
              <div className={styles.progressRow} style={{ justifyContent: 'center' }}>
                <Button
                  appearance="primary"
                  icon={<ArrowSync20Regular />}
                  onClick={() => setFlipped(true)}
                >
                  Show answer
                </Button>
                {reviewed > 0 && (
                  <Button
                    appearance="subtle"
                    icon={<ArrowHookUpLeft20Regular />}
                    onClick={restart}
                  >
                    Restart deck
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
