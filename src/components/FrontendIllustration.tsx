import { tasty } from '@tenphi/tasty';
import {
  IconBrandCss3,
  IconBrandJavascript,
  IconComponents,
  IconPointer,
} from '@tabler/icons-react';

const Scene = tasty({
  as: 'div',
  styles: {
    position: 'relative',
    height: {
      '': '136px',
      '@mobile': '104px',
    },
    overflow: 'visible',
    color: '#text-soft',

    Orbit: {
      position: 'absolute',
      inset: '31px top, -5% left right',
      height: '72px',
      border: '2px dashed #accent-text.28',
      radius: '50%',
      transform: 'rotate(-2deg)',
    },
    Browser: {
      position: 'absolute',
      inset: {
        '': '4px top, 9% left right',
        '@mobile': '4px top, 4% left right',
      },
      height: {
        '': '124px',
        '@mobile': '94px',
      },
      radius: '2r',
      border: '2px solid #text-soft',
      fill: '#surface-2',
      overflow: 'hidden',
      shadow: '0 1x 0 #accent-text.14',
    },
    Toolbar: {
      display: 'flex',
      flow: 'row',
      alignItems: 'center',
      gap: '1x',
      height: {
        '': '30px',
        '@mobile': '3x',
      },
      padding: {
        '': '0 1.5x',
        '@mobile': '0 1x',
      },
      border: '1bw bottom solid #text-soft',
    },
    WindowDot: {
      width: {
        '': '7px',
        '@mobile': '5px',
      },
      height: {
        '': '7px',
        '@mobile': '5px',
      },
      radius: 'round',
      fill: '#text-soft',
    },
    AccentDot: {
      width: {
        '': '7px',
        '@mobile': '5px',
      },
      height: {
        '': '7px',
        '@mobile': '5px',
      },
      radius: 'round',
      fill: '#accent-text',
    },
    Address: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 'auto',
      height: '10px',
      margin: '1x left',
      radius: 'round',
      border: '1bw solid #text-soft.55',
      overflow: 'hidden',
    },
    AddressFill: {
      width: '36%',
      height: '100%',
      fill: '#accent-text',
    },
    Canvas: {
      display: 'grid',
      gridColumns: {
        '': '1.05fr 1.5fr .8fr',
        '@mobile': '1fr 1.35fr .7fr',
      },
      gap: {
        '': '2x',
        '@mobile': '1x',
      },
      alignItems: 'center',
      height: {
        '': '94px',
        '@mobile': '70px',
      },
      padding: {
        '': '1.5x 2x',
        '@mobile': '1x',
      },
    },
    Code: {
      display: 'flex',
      flow: 'column',
      gap: {
        '': '1x',
        '@mobile': '.5x',
      },
    },
    CodeLine: {
      height: {
        '': '7px',
        '@mobile': '5px',
      },
      radius: 'round',
      fill: '#text-soft',
    },
    CodeLineShort: {
      width: '64%',
      height: {
        '': '7px',
        '@mobile': '5px',
      },
      radius: 'round',
      fill: '#accent-text',
    },
    Preview: {
      position: 'relative',
      display: 'grid',
      gridColumns: 'repeat(3, 1fr)',
      gap: {
        '': '1x',
        '@mobile': '.5x',
      },
      padding: {
        '': '1x',
        '@mobile': '.5x',
      },
      height: {
        '': '62px',
        '@mobile': '6x',
      },
      border: '2px solid #accent-text',
      radius: '1r',
    },
    PreviewBlock: {
      radius: '.5r',
      border: '1bw solid #text-soft',
    },
    PreviewAccent: {
      gridColumn: 'span 2',
      radius: '.5r',
      fill: '#accent-text',
    },
    Cursor: {
      position: 'absolute',
      inset: {
        '': '-12px bottom, -15px right',
        '@mobile': '-10px bottom, -11px right',
      },
      display: 'flex',
      color: '#accent-text',
      filter: 'drop-shadow(0 0 2px #surface-2) drop-shadow(0 0 2px #surface-2)',
    },
    Component: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#text-soft',
    },
    CssChip: {
      position: 'absolute',
      inset: {
        '': '22px top, -2px left',
        '@mobile': '17px top, -3px left',
      },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: {
        '': '6x',
        '@mobile': '34px',
      },
      height: {
        '': '6x',
        '@mobile': '34px',
      },
      radius: 'round',
      color: '#accent-text',
      fill: '#surface-2',
      border: '2px solid #accent-text',
      transform: 'rotate(-10deg)',
    },
    JsChip: {
      position: 'absolute',
      inset: {
        '': '55px top, -2px right',
        '@mobile': '42px top, -3px right',
      },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: {
        '': '6x',
        '@mobile': '34px',
      },
      height: {
        '': '6x',
        '@mobile': '34px',
      },
      radius: '1r',
      color: '#text-soft',
      fill: '#surface-2',
      border: '2px solid #text-soft',
      transform: 'rotate(8deg)',
    },
    Spark: {
      position: 'absolute',
      inset: {
        '': '8px top, 14px right',
        '@mobile': '5px top, 7px right',
      },
      width: {
        '': '13px',
        '@mobile': '9px',
      },
      height: {
        '': '13px',
        '@mobile': '9px',
      },
      color: '#accent-text',
      border: '2px solid #accent-text',
      transform: 'rotate(45deg)',
    },
  },
  elements: {
    Orbit: 'div',
    Browser: 'div',
    Toolbar: 'div',
    WindowDot: 'span',
    AccentDot: 'span',
    Address: 'div',
    AddressFill: 'div',
    Canvas: 'div',
    Code: 'div',
    CodeLine: 'span',
    CodeLineShort: 'span',
    Preview: 'div',
    PreviewBlock: 'span',
    PreviewAccent: 'span',
    Cursor: 'span',
    Component: 'span',
    CssChip: 'span',
    JsChip: 'span',
    Spark: 'span',
  },
});

export default function FrontendIllustration() {
  return (
    <Scene aria-hidden="true">
      <Scene.Orbit />
      <Scene.Browser>
        <Scene.Toolbar>
          <Scene.AccentDot />
          <Scene.WindowDot />
          <Scene.WindowDot />
          <Scene.Address>
            <Scene.AddressFill />
          </Scene.Address>
        </Scene.Toolbar>
        <Scene.Canvas>
          <Scene.Code>
            <Scene.CodeLine />
            <Scene.CodeLineShort />
            <Scene.CodeLine />
            <Scene.CodeLineShort />
          </Scene.Code>
          <Scene.Preview>
            <Scene.PreviewAccent />
            <Scene.PreviewBlock />
            <Scene.PreviewBlock />
            <Scene.PreviewAccent />
            <Scene.Cursor>
              <IconPointer size={30} stroke={2.25} fill="currentColor" />
            </Scene.Cursor>
          </Scene.Preview>
          <Scene.Component>
            <IconComponents size={42} stroke={1.6} />
          </Scene.Component>
        </Scene.Canvas>
      </Scene.Browser>
      <Scene.CssChip>
        <IconBrandCss3 size={28} stroke={1.8} />
      </Scene.CssChip>
      <Scene.JsChip>
        <IconBrandJavascript size={28} stroke={1.8} />
      </Scene.JsChip>
      <Scene.Spark />
    </Scene>
  );
}
