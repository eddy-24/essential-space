import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BaseCard } from './BaseCard';
import { textStyles } from '../../design/typography';
import { colors } from '../../design/colors';
import { spacing, radius } from '../../design/spacing';

export const LinkCard = ({ item }) => {
  return (
    <BaseCard item={item}>
      {item.previewImage && (
        <Image 
          source={{ uri: item.previewImage }} 
          style={styles.previewImage} 
          resizeMode="cover" 
        />
      )}
      {item.title && (
        <Text style={[textStyles.heading, styles.title]} numberOfLines={2}>
          {item.title}
        </Text>
      )}
      <Text style={[textStyles.body, { color: colors.text.secondary }]} numberOfLines={1}>
        {item.content}
      </Text>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg.tertiary,
  },
  title: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontSize: 16,
  },
});
