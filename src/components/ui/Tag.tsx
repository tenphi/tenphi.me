import { tasty } from '@tenphi/tasty';

const Tag = tasty({
  as: 'span',
  styles: {
    preset: 'label',
    padding: '0 .5x',
    radius: '1r',
    color: '#accent-surface-text',
    fill: '#accent-surface',
    whiteSpace: 'nowrap',
    shadow: {
      '': '0 1bw 1bw #tiny-shadow, inset 0 1bw .25bw #glass-highlight.3, inset 0 -1bw .25bw #glass-highlight.3',
      '@dark':
        '0 1bw 1bw #tiny-shadow, inset 0 1bw .25bw #glass-highlight.18, inset 0 -1bw .25bw #glass-highlight.18',
      '@high-contrast': 'none',
    },
  },
});

export default Tag;
