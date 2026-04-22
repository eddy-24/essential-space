export const C = {
  bg:          '#0D0C0B',
  card:        '#131211',
  elevated:    '#1A1917',
  pillNav:     'rgba(20,19,18,0.92)',

  textPrimary: '#F0EDE8',
  textSec:     '#D4D0CA',
  textBody:    '#7A7570',
  textMuted:   '#5A5754',
  textDim:     '#4A4744',
  textDarker:  '#3A3835',
  textDark:    '#2E2C2A',
  textGhost:   '#2A2825',

  borderSubtle:  '#1C1B19',
  borderDefault: '#1E1D1B',
  borderMedium:  '#242220',
  borderStrong:  '#2A2826',

  typeImage: '#BF5AF2',
  typeLink:  '#64D2FF',
  typeNote:  '#F0EDE8',
  typeFile:  '#FF9F0A',

  danger:  '#FF3B30',
  success: '#30D158',
};

// Legacy alias so existing imports keep working
export const colors = {
  bg: {
    primary:   C.bg,
    secondary: C.card,
    tertiary:  C.elevated,
    overlay:   'rgba(0,0,0,0.65)',
  },
  text: {
    primary:   C.textPrimary,
    secondary: C.textSec,
    muted:     C.textDim,
    inverse:   C.bg,
  },
  accent: {
    primary: C.textPrimary,
    danger:  C.danger,
    success: C.success,
    link:    C.typeLink,
  },
  type: {
    text:      C.typeNote,
    link:      C.typeLink,
    image:     C.typeImage,
    file:      C.typeFile,
    SCREENSHOT: C.typeImage,
    LINK:       C.typeLink,
    NOTE:       C.typeNote,
    FILE:       C.typeFile,
  },
  border: {
    subtle:  C.borderSubtle,
    default: C.borderDefault,
    strong:  C.borderStrong,
  },
};
