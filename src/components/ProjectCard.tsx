import { tasty } from '@tenphi/tasty';
import {
  IconBrandGithub,
  IconChartBar,
  IconCloud,
  IconComponents,
  IconLayout,
  IconSubtitles,
  IconWorld,
} from '@tabler/icons-react';
import Tag from './ui/Tag';

const Card = tasty({
  as: 'a',
  styles: {
    display: 'flex',
    flow: 'row',
    gap: '3x',
    alignItems: 'flex-start',
    padding: {
      '': '2x',
      '@mobile': '1.5x',
    },
    radius: '1cr',
    border: {
      '': '1bw solid #border',
      ':hover': '1bw solid #accent-text.40',
    },
    fill: {
      '': '#surface',
      ':hover': '#surface #accent-surface.04',
    },
    color: '#text',
    textDecoration: 'none',
    transition: 'theme .2s',

    Icon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 64px',
      width: '64px',
      height: '64px',
      padding: '1x',
      boxSizing: 'border-box',
      radius: '1cr',
      overflow: 'hidden',
      fill: '#surface-2',
      color: '#accent-text',
    },
    IconImage: {
      display: 'block',
      width: '48px',
      height: '48px',
      objectFit: 'contain',
    },
    Body: {
      display: 'flex',
      flow: 'column',
      gap: '1x',
      flex: '1 1 auto',
      minWidth: '0',
    },

    Title: {
      preset: 'h3',
      margin: '0',
      color: {
        '': '#text',
        '@own(:hover)': '#accent-text',
      },
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
  },
  elements: {
    Icon: 'div',
    IconImage: 'img',
    Body: 'div',
    Title: 'h3',
    Description: 'p',
    Tags: 'div',
  },
});

const icons = {
  github: IconBrandGithub,
  chart: IconChartBar,
  cloud: IconCloud,
  components: IconComponents,
  layout: IconLayout,
  subtitles: IconSubtitles,
  world: IconWorld,
};

export interface ProjectCardProps {
  id: string;
  title: string;
  href: string;
  description: string;
  tags: string[];
  icon: string;
}

export default function ProjectCard({
  title,
  href,
  description,
  tags,
  icon,
}: ProjectCardProps) {
  const Icon = icons[icon as keyof typeof icons] ?? IconBrandGithub;

  return (
    <Card href={href}>
      <Card.Icon>
        {icon.startsWith('/') ? (
          <Card.IconImage src={icon} alt="" width={48} height={48} />
        ) : (
          <Icon size={48} stroke={1.5} aria-hidden="true" />
        )}
      </Card.Icon>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
        <Card.Tags>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Card.Tags>
      </Card.Body>
    </Card>
  );
}
