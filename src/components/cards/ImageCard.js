import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { BaseCard } from './BaseCard';
import { radius } from '../../design/spacing';
import { colors } from '../../design/colors';

export const ImageCard = ({ item }) => {
  const imageUrl = item.previewImage || item.content;
  return (
    <BaseCard item={item}>
      {!!imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="cover" 
        />
      )}
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.tertiary,
  },
});
