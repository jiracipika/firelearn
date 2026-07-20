'use client'

/**
 * YouTube facade.
 *
 * Lesson pages embed up to three tutorial videos. Eagerly mounting that many
 * YouTube iframes is expensive: each one pulls ~500KB+ of player JavaScript and
 * fires several third-party requests, which hurts LCP on mobile/field devices
 * and burns metered data.
 *
 * This facade renders a lightweight thumbnail (hqdefault.jpg, ~20-40KB) with an
 * accessible play button. The real iframe is only mounted after the learner
 * clicks (or activates via keyboard), which removes the cost entirely until the
 * video is actually wanted.
 */

import * as React from 'react'
import { Play } from 'lucide-react'
import type { LessonVideo } from '@/types/learning'
import { cn } from '@/lib/utils'

function extractYouTubeId(video: LessonVideo): string | null {
  // The catalog stores both the watch URL and the youtube-nocookie embed URL.
  // The embed URL is the most reliable source of the 11-char id.
  const embedMatch = video.embedUrl.match(/embed\/([A-Za-z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]
  const watchMatch = video.url.match(/[?&]v=([A-Za-z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]
  return null
}

export function VideoFacade({
  video,
  className,
}: {
  video: LessonVideo
  className?: string
}) {
  const [activated, setActivated] = React.useState(false)
  const videoId = extractYouTubeId(video)

  if (!videoId) {
    // Defensive fallback: if we cannot resolve an id, degrade to a plain link
    // instead of a broken thumbnail.
    return (
      <a
        href={video.url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          'flex aspect-video items-center justify-center rounded-lg border border-border bg-black text-sm text-muted-foreground transition hover:border-border-bright hover:text-white',
          className,
        )}
      >
        Watch on YouTube →
      </a>
    )
  }

  if (activated) {
    return (
      <div className={cn('aspect-video bg-black', className)}>
        <iframe
          className="h-full w-full"
          src={`${video.embedUrl}?autoplay=1&rel=0`}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  const thumbnailSrc = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  const posterSrc = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Play video: ${video.title}`}
      className={cn(
        'group relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        className,
      )}
    >
      {/* Thumbnail. hqdefault is always present for valid YouTube ids; if the
          first image fails we fall back to the smaller mqdefault variant, and
          finally to a neutral dark backdrop. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- intentional:
          third-party YouTube thumbnail replaced by the real iframe on click;
          next/image would require remotePatterns config for i.ytimg.com and
          add optimization overhead for an asset that exists only to be swapped
          out, defeating the facade's purpose. */}
      <img
        src={posterSrc}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100 group-hover:scale-[1.02]"
        onError={(event) => {
          const img = event.currentTarget
          if (img.src !== thumbnailSrc) {
            img.src = thumbnailSrc
          }
        }}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600/95 shadow-lg shadow-red-900/40 transition-transform duration-150 group-hover:scale-110">
        <Play size={24} className="ml-1 fill-white text-white" aria-hidden="true" />
      </span>
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 text-left">
        <span className="line-clamp-2 text-xs font-semibold text-white drop-shadow">{video.title}</span>
        <span className="shrink-0 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">YouTube</span>
      </span>
    </button>
  )
}
