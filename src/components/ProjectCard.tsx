import { tasty } from '@tenphi/tasty';
import {
  IconBook,
  IconBrain,
  IconBrandGithub,
  IconPalette,
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
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: '8x',
      width: '8x',
      height: '8x',
      padding: '1x',
      boxSizing: 'border-box',
      radius: '(1r + 1x)',
      overflow: 'hidden',
      fill: '#surface-2',
      color: '#accent-text',
    },
    IconImage: {
      display: 'block',
      width: '6x',
      height: '6x',
      objectFit: 'contain',
      radius: true,
      overflow: 'hidden',
    },
    IconImageLight: {
      display: 'block',
      hide: {
        '': false,
        '@dark': true,
      },
      width: '6x',
      height: '6x',
      objectFit: 'contain',
      radius: true,
      overflow: 'hidden',
    },
    IconImageDark: {
      display: 'block',
      hide: {
        '': true,
        '@dark': false,
      },
      width: '6x',
      height: '6x',
      objectFit: 'contain',
      radius: true,
      overflow: 'hidden',
    },
    IconMask: {
      display: 'block',
      width: '6x',
      height: '6x',
      fill: '#current',
    },
    Body: {
      display: 'flex',
      flow: 'column',
      gap: '1x',
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 'auto',
      width: 'min 0',
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
      flow: 'row wrap',
      gap: '1x',
      padding: '.5x 0 0',
    },
  },
  elements: {
    Icon: 'div',
    IconImage: 'img',
    IconImageLight: 'img',
    IconImageDark: 'img',
    IconMask: 'span',
    Body: 'div',
    Title: 'h3',
    Description: 'p',
    Tags: 'div',
  },
});

const icons = {
  book: IconBook,
  brain: IconBrain,
  github: IconBrandGithub,
  palette: IconPalette,
};

export interface ThemedProjectIcon {
  light: string;
  dark: string;
}

export type ProjectIcon = string | ThemedProjectIcon;

export interface ProjectCardProps {
  id: string;
  title: string;
  href: string;
  description: string;
  tags: string[];
  icon: ProjectIcon;
}

function isThemedIcon(icon: ProjectIcon): icon is ThemedProjectIcon {
  return (
    typeof icon === 'object' &&
    icon !== null &&
    'light' in icon &&
    'dark' in icon
  );
}

function ProjectIconView({ icon }: { icon: ProjectIcon }) {
  if (isThemedIcon(icon)) {
    return (
      <>
        <Card.IconImageLight src={icon.light} alt="" width={48} height={48} />
        <Card.IconImageDark src={icon.dark} alt="" width={48} height={48} />
      </>
    );
  }

  if (icon.startsWith('mask:')) {
    const src = icon.slice('mask:'.length);
    return (
      <Card.IconMask
        aria-hidden="true"
        style={{
          background: 'currentColor',
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    );
  }

  if (icon.startsWith('/')) {
    return <Card.IconImage src={icon} alt="" width={48} height={48} />;
  }

  const Icon = icons[icon as keyof typeof icons] ?? IconBrandGithub;
  return <Icon size={48} stroke={1.5} aria-hidden="true" />;
}

export default function ProjectCard({
  title,
  href,
  description,
  tags,
  icon,
}: ProjectCardProps) {
  return (
    <Card href={href}>
      <Card.Icon>
        <ProjectIconView icon={icon} />
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
