import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';

export const DotGrid = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern id="dotgrid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <Circle cx="1" cy="1" r="1" fill="#F0EDE8" opacity="0.045" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dotgrid)" />
    </Svg>
  </View>
);
