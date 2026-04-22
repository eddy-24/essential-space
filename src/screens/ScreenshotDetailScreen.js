import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../design/colors';
import { spacing, radius } from '../design/spacing';
import { API_HOST } from '../services/api/client';

const categoryColors = {
  EVENT: '#FF3B30',
  WISHLIST: '#FF9F0A',
  DATE: '#30D158',
  NOTE: '#64D2FF',
  LINK: '#BF5AF2',
  OTHER: '#888888',
};

const ScreenshotDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params || {};
  const [ocrExpanded, setOcrExpanded] = useState(false);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  let imageUrl = item.previewImage || item.content;
  if (imageUrl && imageUrl.startsWith('/')) {
    imageUrl = `${API_HOST}${imageUrl}`;
  }

  const category = item.aiCategory || 'OTHER';
  const badgeColor = categoryColors[category] || categoryColors.OTHER;

  const handleAddNote = () => {
    navigation.navigate('NoteEditor', { linkedItemId: item.id });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Full Image */}
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.fullImage} 
            resizeMode="contain" 
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ color: colors.text.muted }}>No Image Available</Text>
          </View>
        )}

        <View style={styles.detailsContainer}>
          {/* Header row: Badge and basic info */}
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: badgeColor + '33', borderColor: badgeColor }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{category}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* AI Summary */}
          {item.aiSummary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Summary</Text>
              <Text style={styles.bodyText}>{item.aiSummary}</Text>
            </View>
          )}

          {/* OCR Text Collapsable */}
          {item.extractedText && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.ocrHeader}
                activeOpacity={0.7}
                onPress={() => setOcrExpanded(!ocrExpanded)}
              >
                <Text style={styles.sectionTitle}>Extracted Text (OCR)</Text>
                <Text style={styles.expandIcon}>{ocrExpanded ? '−' : '+'}</Text>
              </TouchableOpacity>
              
              {ocrExpanded && (
                <View style={styles.ocrContent}>
                  <Text style={styles.ocrText}>{item.extractedText}</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity style={styles.button} onPress={handleAddNote}>
            <Text style={styles.buttonText}>Add Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.text.primary,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  fullImage: {
    width: '100%',
    height: 400,
    backgroundColor: colors.bg.secondary,
  },
  imagePlaceholder: {
    width: '100%',
    height: 400,
    backgroundColor: colors.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 22,
  },
  ocrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  expandIcon: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
  ocrContent: {
    padding: spacing.sm,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  ocrText: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Courier',
  },
  button: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScreenshotDetailScreen;
