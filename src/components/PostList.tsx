import { tasty } from '@tenphi/tasty';
import type { ReactNode } from 'react';

const List = tasty({
  as: 'div',
  styles: {
    display: 'flex',
    flow: 'column',
    gap: '4x',
  },
});

interface PostListProps {
  children: ReactNode;
}

export default function PostList({ children }: PostListProps) {
  return <List>{children}</List>;
}
