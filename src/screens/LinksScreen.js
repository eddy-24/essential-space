import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SectionList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Linking,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { colors } from '../design/colors';
import { spacing, radius } from '../design/spacing';
import { API_HOST } from '../services/api/client';

const LinkCard = ({ item }) => {
  const handlePress = async () => {
    if (item.url) {
      const supported = await Linking.canOpenURL(item.url);
      if (supported) {
        await Linking.openURL(item.url);
      }
    }
  };

  const tags = item.aiTags || [];
  
  // Use previewImage if imageUrl is not available
  let coverImage = item.imageUrl || item.previewImage;
  if (coverImage && coverImage.startsWith('/')) {
    coverImage = `${API_HOST}${coverImage}`;
  }

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
      {coverImage && (
        <Image source={{ uri: coverImage }} style={styles.cardImage} resizeMode="cover" />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title || item.url}
        </Text>
        
        <View style={styles.tagsContainer}>
          {item.aiProcessed === false ? (
            <View style={styles.shimmerTag}>
              <Text style={styles.shimmerText}>Processing AI tags...</Text>
            </View>
          ) : (
            tags.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DomainHeader = ({ section }) => {
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${section.domain}&sz=64`;
  return (
    <View style={styles.header}>
      <Image source={{ uri: faviconUrl }} style={styles.favicon} />
      <Text style={styles.headerDomain}>{section.domain}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.headerCount}>{section.count}</Text>
      </View>
    </View>
  );
};

const LinksScreen = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await itemsApi.getLinksByDomain();
      // Format data for SectionList
      const formatted = data.map(group => ({
        ...group,
        data: group.items || [], // React Native SectionList requires 'data'
      }));
      setSections(formatted);
    } catch (error) {
      console.error('Failed to fetch links by domain', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLinks();
    }, [])
  );

  return (
    <SafeAreaView style={styles.screen}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <LinkCard item={item} />}
          renderSectionHeader={({ section }) => <DomainHeader section={section} />}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No links found.</Text>
            </View>
          }
        />
      )}
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
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  favicon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: spacing.sm,
    backgroundColor: colors.bg.tertiary,
  },
  headerDomain: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.bg.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  headerCount: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.bg.tertiary,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: colors.bg.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  tagText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '500',
  },
  shimmerTag: {
    backgroundColor: colors.bg.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  shimmerText: {
    color: colors.text.muted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.muted,
  },
});

export default LinksScreen;
