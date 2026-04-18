import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { BaseCard } from './BaseCard';
import { textStyles } from '../../design/typography';
import { colors } from '../../design/colors';

export const TextCard = ({ item }) => {
  return (
    <BaseCard item={item}>
      <Text style={[textStyles.body, { color: colors.text.primary }]}>
        {item.content}
      </Text>
    </BaseCard>
  );
};
