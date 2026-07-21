import { tasty } from '@tenphi/tasty';

const ArticleContent = tasty({
  as: 'div',
  styles: {
    display: 'flex',
    flow: 'column',

    H2: {
      $: 'h2',
      preset: 'h2',
      color: '#text',
      margin: {
        '': '3x 0 1.5x',
        '@own(:first-child)': '0 0 1.5x',
        '@own(:last-child)': '3x 0 0',
      },
    },
    H3: {
      $: 'h3',
      preset: 'h3',
      color: '#text',
      margin: {
        '': '2.5x 0 1x',
        '@own(:first-child)': '0 0 1x',
        '@own(:last-child)': '2.5x 0 0',
      },
    },
    P: {
      $: 'p',
      margin: {
        '': '0 0 2x',
        '@own(:last-child) & !@own(:is(summary +))': '0',
      },
    },
    A: {
      $: 'a',
      color: '#accent-text',
      textDecoration: {
        '': 'none',
        '@own(:hover)': 'underline',
      },
    },
    Ul: {
      $: 'ul',
      margin: {
        '': '0 0 2x',
        '@own(:last-child)': '0',
      },
      paddingLeft: '3x',
    },
    Ol: {
      $: 'ol',
      margin: {
        '': '0 0 2x',
        '@own(:last-child)': '0',
      },
      paddingLeft: '3x',
    },
    Li: {
      $: 'li',
      margin: '0 0 .5x',
    },
    Blockquote: {
      $: 'blockquote',
      margin: {
        '': '0 0 2x',
        '@own(:last-child)': '0',
      },
      padding: '0 0 0 2x',
      border: '3bw left',
      preset: 'italic',
      color: '#text-soft',
    },
    Hr: {
      $: 'hr',
      border: 'none',
      height: '1px',
      fill: '#border',
      margin: {
        '': '3x 0',
        '@own(:first-child)': '0 0 3x',
        '@own(:last-child)': '3x 0 0',
      },
    },

    Screenshot: {
      $: 'img:not([src$=".svg"])',
      width: 'max 100%',
      height: 'auto',
      margin: '0 auto',
      border: true,
      radius: true,
    },
    Details: {
      $: 'details',
      border: true,
      radius: true,
      padding: '1x 2x',
      margin: {
        '': '0 0 2x',
        '@own(:last-child)': '0',
      },
    },
    Summary: {
      $: 'summary',
      preset: 'bold',
      cursor: 'pointer',
      color: '#accent-text',
      listStyleType: 'none',
      display: 'flex',
      flow: 'row',
      gap: '1x',
      align: 'center',
    },
    SummaryMarker: {
      $: 'summary::marker',
      display: 'none',
    },
    SummaryWebkitMarker: {
      $: 'summary::-webkit-details-marker',
      display: 'none',
    },
    SummaryChevron: {
      $: 'summary::before',
      content: '""',
      display: 'inline-block',
      width: '.4em',
      height: '.4em',
      border: '2bw solid #accent-text top right',
      transform: 'rotate(45deg)',
      transition: 'translate .2s',
      flexShrink: '0',
    },
    SummaryChevronOpen: {
      $: 'details[open] > summary::before',
      transform: 'rotate(135deg)',
    },
    Code: {
      $: 'p > code, li > code',
      preset: 'code',
      fill: '#surface',
      padding: '0.15em 0.4em',
      border: true,
      radius: true,
    },
    Pre: {
      $: 'pre',
      fill: '#syntax-bg',
      color: '#syntax-text',
      padding: '1x 2x',
      radius: '1r',
      overflow: 'auto',
      preset: 'code',
      border: true,
      scrollbar: 'thin',
      margin: {
        '': '0 0 2x',
        '@own(:last-child)': '0',
      },
    },
    PreCode: {
      $: 'pre code',
      fill: 'transparent',
      padding: '0',
      whiteSpace: 'pre',
    },
    Table: {
      $: 'table',
      width: '100%',
      borderCollapse: 'collapse',
      margin: {
        '': '0 0 2x',
        '@own(:last-child)': '0',
      },
      preset: 'code',
    },
    Th: {
      $: 'th',
      textAlign: 'left',
      padding: '1x 2x',
      border: 'bottom 2bw',
      fontWeight: 600,
    },
    Td: {
      $: 'td',
      padding: '1x 2x',
      border: 'bottom',
    },
  },
});

export default ArticleContent;
