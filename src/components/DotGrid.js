// src/components/DotGrid.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Pattern, Circle, Rect, Defs } from 'react-native-svg';

export const DotGrid = ({ opacity = 0.08 }) => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <Circle cx="1" cy="1" r="1" fill="#FFFFFF" opacity={opacity} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" />
    </Svg>
  </View>
);
