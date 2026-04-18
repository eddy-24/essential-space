import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { API_HOST } from '../services/api/client';
import { colors } from '../design/colors';
import { spacing, radius, layout } from '../design/spacing';

const FILTERS = ['ALL', 'EVENT', 'WISHLIST', 'DATE', 'NOTE', 'LINK', 'OTHER'];

const categoryColors = {
  EVENT: '#FF3B30',
  WISHLIST: '#FF9F0A',
  DATE: '#30D158',
  NOTE: '#64D2FF',
  LINK: '#BF5AF2',
  OTHER: '#888888',
};

const ScreenshotCard = ({ item, onPress, onUpdate }) => {
  const [localItem, setLocalItem] = useState(item);

  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  useEffect(() => {
    let interval;
    if (localItem && localItem.aiProcessed === false) {
      interval = setInterval(async () => {
        try {
          const updatedItem = await itemsApi.getItem(localItem.id);
          setLocalItem(updatedItem);
          if (updatedItem.aiProcessed) {
            clearInterval(interval);
            onUpdate(updatedItem);
          }
        } catch (error) {
          console.error('Failed to poll item', error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [localItem.id, localItem.aiProcessed, onUpdate]);

  let imageUrl = localItem.previewImage || localItem.content;
  if (imageUrl && imageUrl.startsWith('/')) {
    imageUrl = `${API_HOST}${imageUrl}`;
  }

  const category = localItem.aiCategory || 'OTHER';
  const badgeColor = categoryColors[category] || categoryColors.OTHER;

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.8}
      onPress={() => onPress(localItem)}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder} />
        )}
        
        {/* Loading Indicator Overlay */}
        {localItem.aiProcessed === false && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.accent.primary} />
          </View>
        )}
      </View>
      
      {/* Category Badge */}
      <View style={[styles.badge, { backgroundColor: badgeColor + '33', borderColor: badgeColor }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>{category}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ScreenshotsScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const navigation = useNavigation();

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Fetch only items of type IMAGE or ones with previewImage? 
      // For now, type=IMAGE based on standard behavior.
      const fetched = await itemsApi.getAllItems({ type: 'IMAGE' });
      setItems(fetched);
    } catch (error) {
      console.error('Failed to fetch screenshots', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const handleItemUpdate = useCallback((updatedItem) => {
    setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
  }, []);

  const handleCardPress = (item) => {
    navigation.navigate('ScreenshotDetail', { item });
  };

  const filteredItems = items.filter(it => {
    if (activeFilter === 'ALL') return true;
    const cat = it.aiCategory || 'OTHER';
    return cat === activeFilter;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ScreenshotCard item={item} onPress={handleCardPress} onUpdate={handleItemUpdate} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No screenshots found.</Text>
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
  filterContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterChipActive: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  filterText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.bg.primary,
  },
  grid: {
    padding: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.bg.tertiary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.muted,
  },
});

export default ScreenshotsScreen;
