import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../design/colors';
import { spacing, radius, layout } from '../../design/spacing';
import { textStyles } from '../../design/typography';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const BaseCard = ({ item, children }) => {
  const typeColor = colors.type[item.type?.toLowerCase()] || colors.text.primary;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeIndicatorContainer}>
          <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
          <Text style={textStyles.mono_sm}>{item.type}</Text>
        </View>
        <Text style={textStyles.mono_sm}>{formatDate(item.createdAt)}</Text>
      </View>
      
      <View style={styles.body}>
        {children}
      </View>

      {!!item.note && (
        <View style={styles.footer}>
          <Text style={[textStyles.mono_sm, { color: colors.text.muted }]}>
            {item.note}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: layout.cardPadding,
    marginBottom: layout.cardGap,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  body: {
    marginVertical: spacing.xs,
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});
