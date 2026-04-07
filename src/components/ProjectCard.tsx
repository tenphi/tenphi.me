import { tasty } from '@tenphi/tasty';

const ProjectCard = tasty({
  as: 'article',
  styles: {
    display: 'flex',
    flow: 'column',
    gap: '1x',
    padding: '3x',
    radius: '1r',
    border: true,

    Title: {
      preset: 'h3',
      color: {
        '': '#text',
        '@own(:hover)': '#accent-text',
      },
      textDecoration: 'none',
      transition: 'color 0.15s',
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
      padding: '.5x 0 0',
    },
    Tag: {
      preset: 'label',
      color: '#text-soft',
      textTransform: 'uppercase',
    },
  },
  elements: {
    Title: 'a',
    Description: 'p',
    Tags: 'div',
    Tag: 'span',
  },
});

export default ProjectCard;
