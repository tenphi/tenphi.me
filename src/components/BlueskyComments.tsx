import { tasty } from '@tenphi/tasty';
import type { BlueskyReply } from '../lib/bluesky';

const Wrapper = tasty({
  as: 'section',
  styles: {
    display: 'flex',
    flow: 'column',
    gap: '3x',

    Header: {
      display: 'flex',
      flow: 'row',
      gap: '1x',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    Title: {
      preset: 'h3',
      color: '#text',
      margin: '0',
    },
    ReplyLink: {
      preset: 'bold',
      color: {
        '': '#accent-text',
        ':hover': '#accent-text-2',
      },
      textDecoration: {
        '': 'none',
        ':hover': 'underline',
      },
      transition: 'color 0.15s',
    },
    Empty: {
      preset: 't3',
      color: '#text-soft',
      margin: '0',
    },
    List: {
      display: 'flex',
      flow: 'column',
      gap: '2x',
      padding: '0',
      margin: '0',
      listStyle: 'none',
    },
  },
  elements: {
    Header: 'div',
    Title: 'h2',
    ReplyLink: 'a',
    Empty: 'p',
    List: 'ul',
  },
});

const Comment = tasty({
  as: 'li',
  styles: {
    display: 'flex',
    flow: 'row',
    gap: '1.5x',
    alignItems: 'flex-start',

    Avatar: {
      display: 'block',
      width: '5x',
      height: '5x',
      radius: 'round',
      fill: '#surface-2',
      flex: '0 0 auto',
    },
    Body: {
      display: 'flex',
      flow: 'column',
      gap: '.5x',
      flex: '1 1 auto',
      minWidth: '0',
    },
    Head: {
      display: 'flex',
      flow: 'row',
      gap: '1x',
      alignItems: 'baseline',
      flexWrap: 'wrap',
    },
    Author: {
      preset: 'bold',
      color: {
        '': '#text',
        '@own(:hover)': '#accent-text',
      },
      textDecoration: 'none',
      transition: 'color 0.15s',
    },
    Handle: {
      preset: 'overline',
      color: '#text-soft',
    },
    Text: {
      preset: 't3',
      color: '#text',
      margin: '0',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
  },
  elements: {
    Avatar: 'img',
    Body: 'div',
    Head: 'div',
    Author: 'a',
    Handle: 'span',
    Text: 'p',
  },
});

interface BlueskyCommentsProps {
  replies: BlueskyReply[];
  postUrl: string;
}

export default function BlueskyComments({
  replies,
  postUrl,
}: BlueskyCommentsProps) {
  return (
    <Wrapper>
      <Wrapper.Header>
        <Wrapper.Title>Comments</Wrapper.Title>
        <Wrapper.ReplyLink
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Reply on Bluesky &rarr;
        </Wrapper.ReplyLink>
      </Wrapper.Header>
      {replies.length === 0 ? (
        <Wrapper.Empty>
          No comments yet. Start the conversation on Bluesky.
        </Wrapper.Empty>
      ) : (
        <Wrapper.List>
          {replies.map((reply) => (
            <Comment key={reply.uri}>
              {reply.authorAvatar && (
                <Comment.Avatar
                  src={reply.authorAvatar}
                  alt=""
                  width="40"
                  height="40"
                  loading="lazy"
                />
              )}
              <Comment.Body>
                <Comment.Head>
                  <Comment.Author
                    href={reply.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {reply.authorName}
                  </Comment.Author>
                  <Comment.Handle>@{reply.authorHandle}</Comment.Handle>
                </Comment.Head>
                <Comment.Text>{reply.text}</Comment.Text>
              </Comment.Body>
            </Comment>
          ))}
        </Wrapper.List>
      )}
    </Wrapper>
  );
}
