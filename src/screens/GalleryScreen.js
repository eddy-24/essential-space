import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { screenshotsApi } from '../services/api/screenshotsApi';
import { API_HOST } from '../services/api/client';

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.${String(d.getFullYear()).slice(2)}`;
  } catch { return ''; }
}

export default function GalleryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const navigation = useNavigation();

  const fetchItems = useCallback(() => {
    setLoading(true);
    screenshotsApi.getScreenshots({})
      .then(data => { setItems(data || []); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  useFocusEffect(fetchItems);

  // Derive categories dynamically from items
  const categories = useMemo(() => {
    const known = ['ALL'];
    const seen = new Set();
    items.forEach(i => {
      if (i.aiCategory && !seen.has(i.aiCategory)) {
        seen.add(i.aiCategory);
        known.push(i.aiCategory);
      }
    });
    return known;
  }, [items]);

  // Client-side filter
  const filtered = useMemo(() => {
    return items.filter(i => {
      const catMatch = activeCategory === 'ALL' || (i.aiCategory && i.aiCategory.toUpperCase() === activeCategory);
      const q = search.toLowerCase();
      const textMatch = !q || (
        (i.generatedTitle && i.generatedTitle.toLowerCase().includes(q)) ||
        (i.aiSummary && i.aiSummary.toLowerCase().includes(q)) ||
        (i.ocrText && i.ocrText.toLowerCase().includes(q))
      );
      return catMatch && textMatch;
    });
  }, [items, activeCategory, search]);

  const renderCard = ({ item }) => {
    const isProcessing = item.processingStatus === 'PROCESSING';
    const isFailed = item.processingStatus === 'FAILED';
    const imageUri = item.imageUrl?.startsWith('/') ? `${API_HOST}${item.imageUrl}` : item.imageUrl;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ScreenshotDetail', { id: item.id })}
        activeOpacity={0.75}
      >
        {/* Image area */}
        <View style={styles.cardImageWrap}>
          <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
          {/* Category badge */}
          {!isProcessing && !isFailed && item.aiCategory && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.aiCategory}</Text>
            </View>
          )}
          {isProcessing && (
            <View style={[styles.categoryBadge, styles.categoryBadgeProcessing]}>
              <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 4 }} />
              <Text style={styles.categoryBadgeText}>PROCESSING</Text>
            </View>
          )}
          {isFailed && (
            <View style={[styles.categoryBadge, styles.categoryBadgeFailed]}>
              <Text style={[styles.categoryBadgeText, { color: '#ff6b6b' }]}>FAILED</Text>
            </View>
          )}
        </View>

        {/* Card content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.generatedTitle || (isFailed ? 'Processing Failed' : isProcessing ? 'Analyzing...' : 'Untitled')}
          </Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText} numberOfLines={1}>
              {item.originalFilename || '—'}
            </Text>
            <Text style={styles.cardMetaText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputRow}>
          <View style={styles.searchIconSmall}>
            <View style={styles.searchCircleSmall} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved items..."
            placeholderTextColor="#8e9192"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        <View style={styles.searchUnderline} />
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {categories.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.filterChip, activeCategory === c && styles.filterChipActive]}
            onPress={() => setActiveCategory(c)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeCategory === c && styles.filterTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Gallery list */}
      {loading && items.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchItems}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyLabel}>NO ITEMS FOUND</Text>
              <Text style={styles.emptySubtext}>Upload a screenshot to get started.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#131313',
  },

  searchHandle: {
    width: 6,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
    position: 'absolute',
    bottom: 1,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },

  // Search bar
  searchBar: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  searchIconSmall: {
    marginRight: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircleSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#8e9192',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSansRegular',
    fontSize: 16,
    color: '#ffffff',
    padding: 0,
    margin: 0,
  },
  searchUnderline: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Filters
  filtersScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 64,
    marginTop: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    height: 40,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: '#1b1b1b',
    marginRight: 8,
    flexShrink: 0,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    height: 40,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    marginRight: 8,
    flexShrink: 0,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 13,
    letterSpacing: 1,
    color: '#e2e2e2',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  filterTextActive: {
    fontFamily: 'DMMonoMedium',
    fontSize: 13,
    letterSpacing: 1,
    color: '#000000',
    textTransform: 'uppercase',
    flexShrink: 0,
  },

  // List
  list: {
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card
  card: {
    borderWidth: 1,
    borderColor: 'rgba(142,145,146,0.2)',
    backgroundColor: '#1b1b1b',
    overflow: 'hidden',
  },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1f1f1f',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(19,19,19,0.85)',
  },
  categoryBadgeProcessing: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  categoryBadgeFailed: {
    borderColor: '#ff6b6b',
  },
  categoryBadgeText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(142,145,146,0.2)',
    gap: 6,
  },
  cardTitle: {
    fontFamily: 'DMMonoMedium',
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMetaText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#8e9192',
    flex: 1,
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyLabel: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 3,
    color: '#444748',
  },
  emptySubtext: {
    fontFamily: 'DMSansRegular',
    fontSize: 14,
    color: '#444748',
  },
});
