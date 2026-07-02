import { tasty } from '@tenphi/tasty';
import Tag from './ui/Tag';

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
      display: 'flex',
      flow: 'row',
      gap: '1x',
      alignItems: 'center',
      preset: 'overline',
      color: '#text-soft',
    },
    Description: {
      preset: 't2',
      color: '#text-soft',
      margin: '0',
    },
    Tags: {
      display: 'flex',
      flow: 'row',
      gap: '1x',
      flexWrap: 'wrap',
    },
  },
  elements: {
    Title: 'a',
    Meta: 'div',
    Description: 'p',
    Tags: 'div',
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
  readTime?: string;
  tags?: string[];
}

export default function PostCardView({
  title,
  date,
  description,
  slug,
  readTime,
  tags,
}: PostCardProps) {
  return (
    <PostCard>
      <PostCard.Meta style={{ viewTransitionName: `meta-${slug}` }}>
        <time dateTime={date.toISOString().split('T')[0]}>
          {formatDate(date)}
        </time>
        {readTime && (
          <>
            <span>&middot;</span>
            <span>{readTime}</span>
          </>
        )}
      </PostCard.Meta>
      <PostCard.Title
        href={`/blog/${slug}`}
        style={{ viewTransitionName: `title-${slug}` }}
      >
        {title}
      </PostCard.Title>
      <PostCard.Description
        style={{ viewTransitionName: `description-${slug}` }}
      >
        {description}
      </PostCard.Description>
      {tags && tags.length > 0 && (
        <PostCard.Tags style={{ viewTransitionName: `tags-${slug}` }}>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </PostCard.Tags>
      )}
    </PostCard>
  );
}
