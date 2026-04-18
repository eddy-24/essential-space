import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { BaseCard } from './BaseCard';
import { radius } from '../../design/spacing';
import { colors } from '../../design/colors';
import { API_HOST } from '../../services/api/client';

export const ImageCard = ({ item }) => {
  let imageUrl = item.previewImage || item.content;
  if (imageUrl && imageUrl.startsWith('/')) {
    imageUrl = `${API_HOST}${imageUrl}`;
  }

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
