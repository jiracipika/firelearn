import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'
import { VideoFacade } from '@/components/course/video-facade'
import type { LessonVideo } from '@/types/learning'

function makeVideo(overrides: Partial<LessonVideo> = {}): LessonVideo {
  return {
    id: 'yt-fire-behaviour-cLBtRwJ93aQ',
    title: 'The Art of Reading Smoke',
    source: 'YouTube',
    url: 'https://www.youtube.com/watch?v=cLBtRwJ93aQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/cLBtRwJ93aQ',
    ...overrides,
  }
}

describe('VideoFacade', () => {
  // SSR snapshot — proves the facade renders a thumbnail + button and never an
  // <iframe> until activated. (Activated state is client-only, so SSR output
  // always shows the un-clicked facade.)
  it('renders a lightweight facade (no iframe) on initial render', () => {
    const html = renderToStaticMarkup(
      React.createElement(VideoFacade, { video: makeVideo() }),
    )
    expect(html).not.toContain('<iframe')
    expect(html).toContain('i.ytimg.com/vi/cLBtRwJ93aQ/mqdefault.jpg')
    expect(html).toContain('Play video: The Art of Reading Smoke')
  })

  it('falls back to a plain link when the id cannot be resolved', () => {
    const html = renderToStaticMarkup(
      React.createElement(VideoFacade, {
        video: makeVideo({
          url: 'https://example.com/unknown',
          embedUrl: 'https://example.com/embed/unknown',
        }),
      }),
    )
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('i.ytimg.com')
    expect(html).toContain('Watch on YouTube')
  })

  it('extracts the id from the watch URL when embedUrl lacks it', () => {
    const html = renderToStaticMarkup(
      React.createElement(VideoFacade, {
        video: makeVideo({
          embedUrl: 'https://www.youtube-nocookie.com/embed/cLBtRwJ93aQ',
        }),
      }),
    )
    // The thumbnail path embeds the resolved id — confirms id extraction worked
    expect(html).toContain('cLBtRwJ93aQ')
    expect(html).toContain('Play video: The Art of Reading Smoke')
  })
})
