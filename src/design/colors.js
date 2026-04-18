// src/design/colors.js
export const colors = {
  // Backgrounds
  bg: {
    primary:   '#0A0A0A',  // fundal principal (aproape negru)
    secondary: '#141414',  // card background
    tertiary:  '#1E1E1E',  // input, elevated elements
    overlay:   '#000000CC', // modal overlay
  },

  // Text
  text: {
    primary:   '#F5F5F5',  // text principal
    secondary: '#888888',  // text secundar, metadate
    muted:     '#444444',  // placeholder, disabled
    inverse:   '#0A0A0A',  // text pe background deschis
  },

  // Accent — Nothing OS foloseste alb/rosu, noi mergem pe alb pur
  accent: {
    primary:   '#FFFFFF',  // accente principale
    danger:    '#FF3B30',  // delete, destructive actions
    success:   '#30D158',  // confirm, saved
    link:      '#64D2FF',  // link type indicator
  },

  // Type indicators (colored dots per item type)
  type: {
    text:  '#FFFFFF',
    link:  '#64D2FF',
    image: '#BF5AF2',
    file:  '#FF9F0A',
  },

  // Border
  border: {
    subtle:  '#1E1E1E',
    default: '#2C2C2C',
    strong:  '#444444',
  },
};
