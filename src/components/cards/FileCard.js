import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from './BaseCard';
import { textStyles } from '../../design/typography';
import { colors } from '../../design/colors';
import { spacing } from '../../design/spacing';

export const FileCard = ({ item }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <BaseCard item={item}>
      <View style={styles.container}>
        <Text style={[textStyles.body, styles.fileName]} numberOfLines={1}>
          {item.fileName || 'Unknown File'}
        </Text>
        <Text style={[textStyles.mono_sm, styles.fileSize]}>
          {formatBytes(item.fileSize)}
        </Text>
      </View>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  fileName: {
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  fileSize: {
    color: colors.text.secondary,
  },
});
