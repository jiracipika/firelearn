import {
  createLightTheme,
  createDarkTheme,
  type BrandVariants,
  type Theme,
} from '@fluentui/react-components'

// Fire-service brand ramp: deep ember reds climbing to bright flame.
const fireBrand: BrandVariants = {
  10: '#2A0805',
  20: '#3F0C06',
  30: '#540D05',
  40: '#6E1106',
  50: '#891405',
  60: '#A41705',
  70: '#C01A04',
  80: '#DB2818',
  90: '#E83F25',
  100: '#F25734',
  110: '#F66D48',
  120: '#FA835E',
  130: '#FC9978',
  140: '#FDAF93',
  150: '#FEC5AF',
  160: '#FFDACB',
}

export const fireLightTheme: Theme = createLightTheme(fireBrand)

export const fireDarkTheme: Theme = {
  ...createDarkTheme(fireBrand),
}

// Tune the dark theme toward a navy / charcoal fireground feel.
fireDarkTheme.colorNeutralBackground1 = '#161A21' // cards / surfaces
fireDarkTheme.colorNeutralBackground1Hover = '#1D222B'
fireDarkTheme.colorNeutralBackground1Pressed = '#11151B'
fireDarkTheme.colorNeutralBackground2 = '#0E1117' // page background
fireDarkTheme.colorNeutralBackground3 = '#1D222B' // inset areas
fireDarkTheme.colorNeutralBackground4 = '#0B0E13'
fireDarkTheme.colorNeutralBackgroundDisabled = '#1A1F27'

// Make brand text/icons read as warm amber-red on dark.
fireDarkTheme.colorBrandForeground1 = fireBrand[120]
fireDarkTheme.colorBrandForeground2 = fireBrand[130]

export { fireBrand }
