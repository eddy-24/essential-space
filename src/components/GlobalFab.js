import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { screenshotsApi } from '../services/api/screenshotsApi';

export const GlobalFab = ({ onUploadSuccess }) => {

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || 'screenshot.jpg',
        type: asset.type || 'image/jpeg',
      };
      try {
        await screenshotsApi.uploadScreenshot(file);
        if (onUploadSuccess) onUploadSuccess();
      } catch (e) {
        console.error('Upload failed', e);
      }
    }
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handlePickImage} activeOpacity={0.8}>
      <Text style={styles.fabIcon}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  fabIcon: {
    fontSize: 32,
    color: '#0a0a0a',
    fontWeight: '300',
    marginTop: -2,
  },
});
