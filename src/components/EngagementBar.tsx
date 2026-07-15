import { tasty } from '@tenphi/tasty';

const Bar = tasty({
  as: 'div',
  styles: {
    display: 'flex',
    flow: 'row',
    gap: '2x',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '3x 0',
    border: 'top #border',

    Stat: {
      display: 'flex',
      flow: 'row',
      gap: '.75x',
      alignItems: 'center',
      preset: 't3',
      color: {
        '': '#text-soft',
        '@own(:hover)': '#accent-text',
      },
      textDecoration: 'none',
      transition: 'color 0.15s',
    },
    Spacer: {
      flex: '1 1 auto',
    },
    Follow: {
      display: 'flex',
      flow: 'row',
      gap: '.75x',
      alignItems: 'center',
      preset: 'label',
      padding: '.75x 1.5x',
      radius: '1r',
      color: '#accent-surface-text',
      fill: {
        '': '#accent-surface',
        '@own(:hover)': '#accent-surface-text-hover',
      },
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transition: 'fill 0.15s',
    },
  },
  elements: {
    Stat: 'a',
    Spacer: 'div',
    Follow: 'a',
  },
});

const HeartIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
  </svg>
);

const RepostIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 4l4 4l-4 4" />
    <path d="M7 20l-4 -4l4 -4" />
    <path d="M21 8h-13a2 2 0 0 0 -2 2v2m1 6h13a2 2 0 0 0 2 -2v-2" />
  </svg>
);

const ReplyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 9h8" />
    <path d="M8 13h6" />
    <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h11z" />
  </svg>
);

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

interface EngagementBarProps {
  postUrl: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  followersCount: number | null;
  profileUrl: string;
}

export default function EngagementBar({
  postUrl,
  likeCount,
  repostCount,
  replyCount,
  followersCount,
  profileUrl,
}: EngagementBarProps) {
  return (
    <Bar>
      <Bar.Stat
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${likeCount} recommends on Bluesky`}
      >
        <HeartIcon />
        {formatCount(likeCount)}
      </Bar.Stat>
      <Bar.Stat
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${repostCount} reposts on Bluesky`}
      >
        <RepostIcon />
        {formatCount(repostCount)}
      </Bar.Stat>
      <Bar.Stat
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${replyCount} replies on Bluesky`}
      >
        <ReplyIcon />
        {formatCount(replyCount)}
      </Bar.Stat>
      <Bar.Spacer />
      <Bar.Follow href={profileUrl} target="_blank" rel="noopener noreferrer">
        Follow on Bluesky
        {followersCount != null && ` · ${formatCount(followersCount)}`}
      </Bar.Follow>
    </Bar>
  );
}
