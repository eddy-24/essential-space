import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { C } from '../design/colors';

export const IcFeed = ({ c = C.textDim, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Rect x="2" y="2" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.3" />
    <Rect x="11" y="2" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.3" />
    <Rect x="2" y="11" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.3" />
    <Rect x="11" y="11" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.3" />
  </Svg>
);

export const IcSearch = ({ c = C.textDim, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="9" cy="9" r="6" stroke={c} strokeWidth="1.3" />
    <Path d="M14 14l3 3" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
  </Svg>
);

export const IcNote = ({ c = C.textDim, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path d="M5 6h10M5 10h7M5 14h9" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
  </Svg>
);

export const IcFile = ({ c = C.textDim, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path d="M5 2h7l4 4v12H5V2z" stroke={c} strokeWidth="1.3" />
    <Path d="M12 2v4h4" stroke={c} strokeWidth="1.2" />
  </Svg>
);

export const IcBack = ({ c = C.textMuted, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path d="M11 4.5L6.5 9l4.5 4.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IcCheck = ({ size = 10 }) => (
  <Svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <Path d="M2 5l2.2 2.2L8 3" stroke={C.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IcLink = ({ c = C.textDarker, size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <Path d="M5 6.5C5.5 7 6.3 7.3 7 7.1L8.5 6.8C9.5 6.5 10.1 5.5 9.9 4.5C9.7 3.5 8.7 2.9 7.7 3.1L6.8 3.3" stroke={c} strokeWidth="1" strokeLinecap="round" />
    <Path d="M7 5.5C6.5 5 5.7 4.7 5 4.9L3.5 5.2C2.5 5.5 1.9 6.5 2.1 7.5C2.3 8.5 3.3 9.1 4.3 8.9L5.2 8.7" stroke={c} strokeWidth="1" strokeLinecap="round" />
  </Svg>
);

// Thumb icons for feed cards
export const ThMusic = ({ c = C.textPrimary }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M9 18V7l11-3v11" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="6" cy="18" r="3" stroke={c} strokeWidth="1.2" />
    <Circle cx="17" cy="15" r="3" stroke={c} strokeWidth="1.2" />
  </Svg>
);

export const ThLink = ({ c = C.textPrimary }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M10 15C10.8 15.8 12 16.2 13.1 15.9L15.8 15.3C17.4 14.9 18.3 13.3 17.9 11.7 17.6 10.1 16 9.2 14.4 9.5L12.9 9.8" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M14 9C13.2 8.2 12 7.8 10.9 8.1L8.2 8.7C6.6 9.1 5.7 10.7 6.1 12.3 6.4 13.9 8 14.8 9.6 14.5L11.1 14.2" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

export const ThDoc = ({ c = C.textPrimary }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M5 3h9l5 5v13H5V3z" stroke={c} strokeWidth="1.2" />
    <Path d="M14 3v5h5" stroke={c} strokeWidth="1.1" />
    <Path d="M8 12h8M8 16h5" stroke={c} strokeWidth="1.1" strokeLinecap="round" />
  </Svg>
);

export const ThPlay = ({ c = C.textPrimary }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.2" />
    <Path d="M10 8.5l6 3.5-6 3.5V8.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round" />
  </Svg>
);

export const ThNote = ({ c = C.textPrimary }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="3" width="16" height="18" rx="2.5" stroke={c} strokeWidth="1.2" />
    <Path d="M8 8.5h8M8 12h6M8 15.5h8" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

export const ThImage = ({ c = C.textPrimary }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="14" rx="2.5" stroke={c} strokeWidth="1.2" />
    <Circle cx="8.5" cy="9.5" r="1.5" stroke={c} strokeWidth="1.1" />
    <Path d="M3 16l4.5-4 3 3 3-2.5L21 19" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Capture sheet icons (28x28)
export const IcCapScreenshot = ({ c = C.textPrimary }) => (
  <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <Rect x="3" y="6" width="22" height="17" rx="3" stroke={c} strokeWidth="1.3" />
    <Circle cx="14" cy="14.5" r="4.5" stroke={c} strokeWidth="1.3" />
    <Circle cx="14" cy="14.5" r="1.5" fill={c} />
    <Path d="M10 6l1.5-2h5L18 6" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="19.5" y="8.5" width="2" height="2" rx="0.5" fill={c} opacity="0.5" />
  </Svg>
);

export const IcCapLink = ({ c = C.textPrimary }) => (
  <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <Path d="M11 16.5C12 17.5 13.5 18 14.9 17.7L18 17C19.9 16.5 21.2 14.6 20.7 12.7C20.3 10.8 18.3 9.6 16.4 10L14.5 10.4" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    <Path d="M17 11.5C16 10.5 14.5 10 13.1 10.3L10 11C8.1 11.5 6.8 13.4 7.3 15.3C7.7 17.2 9.7 18.4 11.6 18L13.5 17.6" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
  </Svg>
);

export const IcCapNote = ({ c = C.textPrimary }) => (
  <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <Rect x="5" y="4" width="18" height="20" rx="3" stroke={c} strokeWidth="1.3" />
    <Path d="M9 10h10M9 14h7M9 18h9" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
  </Svg>
);

export const IcCapFile = ({ c = C.textPrimary }) => (
  <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <Path d="M7 4h10l6 6v14H7V4z" stroke={c} strokeWidth="1.3" />
    <Path d="M17 4v6h6" stroke={c} strokeWidth="1.2" />
    <Path d="M11 14h6M11 18h4" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

// Status bar icons
export const IcSignal = () => (
  <Svg width="17" height="12" viewBox="0 0 17 12" fill={C.textPrimary}>
    <Rect x="0" y="4" width="3" height="8" rx="0.8" opacity="0.4" />
    <Rect x="4.5" y="2.5" width="3" height="9.5" rx="0.8" opacity="0.6" />
    <Rect x="9" y="1" width="3" height="11" rx="0.8" opacity="0.8" />
    <Rect x="13.5" y="0" width="3" height="12" rx="0.8" />
  </Svg>
);

export const IcWifi = () => (
  <Svg width="16" height="12" viewBox="0 0 16 12" fill="none">
    <Path d="M8 3C5.3 3 2.9 4.2 1.3 6.2L2.8 7.6C4 6.1 5.9 5.1 8 5.1s4 1 5.2 2.5L14.7 6.2C13.1 4.2 10.7 3 8 3z" fill={C.textPrimary} />
    <Path d="M8 7C6.6 7 5.4 7.6 4.6 8.6L6.1 10C6.6 9.4 7.3 9 8 9s1.4.4 1.9 1L11.4 8.6C10.6 7.6 9.4 7 8 7z" fill={C.textPrimary} />
    <Circle cx="8" cy="11.5" r="0.8" fill={C.textPrimary} />
  </Svg>
);

export const IcBattery = () => (
  <Svg width="26" height="13" viewBox="0 0 26 13">
    <Rect x="0.5" y="0.5" width="21" height="12" rx="3.5" stroke={C.textPrimary} strokeOpacity="0.3" />
    <Rect x="2" y="2" width="17" height="9" rx="2" fill={C.textPrimary} />
    <Path d="M23.5 4.5v4c1.1-.5 1.1-3.5 0-4z" fill={C.textPrimary} fillOpacity="0.4" />
  </Svg>
);
