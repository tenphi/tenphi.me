import { tasty } from '@tenphi/tasty';

const PostCard = tasty({
  as: 'article',
  styles: {
    display: 'flex',
    flow: 'column',
    gap: '1x',

    Title: {
      preset: 'h3',
      color: {
        '': '#text',
        '@own(:hover)': '#accent-text',
      },
      textDecoration: 'none',
      transition: 'color 0.15s',
    },
    Meta: {
      preset: 't3',
      color: '#text-soft',
    },
    Description: {
      preset: 't2',
      color: '#text-soft',
      margin: '0',
    },
  },
  elements: {
    Title: 'a',
    Meta: 'time',
    Description: 'p',
  },
});

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface PostCardProps {
  title: string;
  date: Date;
  description: string;
  slug: string;
}

export default function PostCardView({
  title,
  date,
  description,
  slug,
}: PostCardProps) {
  return (
    <PostCard>
      <PostCard.Title href={`/blog/${slug}`}>{title}</PostCard.Title>
      <PostCard.Meta dateTime={date.toISOString().split('T')[0]}>
        {formatDate(date)}
      </PostCard.Meta>
      <PostCard.Description>{description}</PostCard.Description>
    </PostCard>
  );
}
