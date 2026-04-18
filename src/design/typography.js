// src/design/typography.js
export const typography = {
  fonts: {
    mono: 'DMMonoRegular',      // DM Mono — metadate, timestamps, labels
    monoMedium: 'DMMonoMedium',
    sans: 'DMSansRegular',      // DM Sans — body text
    sansMedium: 'DMSansMedium',
    sansBold: 'DMSansBold',
  },

  sizes: {
    xs:  10,
    sm:  12,
    md:  14,
    lg:  16,
    xl:  20,
    xxl: 28,
  },

  lineHeights: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
};

// Preset-uri comune
export const textStyles = {
  // Timestamp, tip item, label colecție
  mono_sm: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: '#888888',
    letterSpacing: 0.5,
  },
  // Label / category
  mono_md: {
    fontFamily: typography.fonts.monoMedium,
    fontSize: typography.sizes.md,
    letterSpacing: 0.3,
  },
  // Body text în card
  body: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * 1.5,
  },
  // Titlu screen
  heading: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.xl,
    letterSpacing: -0.3,
  },
};
