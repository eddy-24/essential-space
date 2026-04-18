import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { API_HOST } from '../services/api/client';
import Svg, { Circle, Pattern, Rect, Defs } from 'react-native-svg';

const DotGrid = () => (
  <View style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern id="dot" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <Circle cx="2" cy="2" r="1" fill="#1e1e1e" />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#dot)" />
    </Svg>
  </View>
);

const FILTERS = ['ALL', 'EVENT', 'WISHLIST', 'DATE', 'NOTE', 'LINK', 'OTHER'];

const categoryStyles = {
  EVENT: { color: '#FF3B30', bg: '#FF3B3022' },
  WISHLIST: { color: '#FF9F0A', bg: '#FF9F0A22' },
  DATE: { color: '#30D158', bg: '#30D15822' },
  NOTE: { color: '#64D2FF', bg: '#64D2FF22' },
  LINK: { color: '#BF5AF2', bg: '#BF5AF222' },
  OTHER: { color: '#888888', bg: '#88888822' },
};

const ScreenshotCard = ({ item, onPress, onUpdate }) => {
  const [localItem, setLocalItem] = useState(item);

  useEffect(() => setLocalItem(item), [item]);

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
        } catch (e) {}
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [localItem.id, localItem.aiProcessed, onUpdate]);

  const cat = localItem.aiCategory || 'OTHER';
  const cStyles = categoryStyles[cat] || categoryStyles.OTHER;

  let imageUrl = localItem.previewImage || localItem.content;
  if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${API_HOST}${imageUrl}`;

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(localItem)}>
      {localItem.aiProcessed === false ? (
        <View style={styles.shimmerContainer}>
           <Text style={styles.shimmerText}>analyzing...</Text>
        </View>
      ) : (
        <>
          <View style={[styles.thumbnailContainer, { backgroundColor: cStyles.bg }]}>
             {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.thumbnail} /> : null}
          </View>
          <View style={[styles.badge, { backgroundColor: cStyles.bg }]}>
            <Text style={[styles.badgeText, { color: cStyles.color }]}>{cat}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{localItem.title || 'Untitled'}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default function ScreenshotsScreen() {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const nav = useNavigation();

  useFocusEffect(useCallback(() => {
    // We fetch type=SCREENSHOT based on API contract G1
    itemsApi.getAllItems({ type: 'SCREENSHOT' }).then(setItems).catch(() => {});
  }, []));

  const filtered = items.filter(it => activeFilter === 'ALL' || (it.aiCategory || 'OTHER') === activeFilter);

  return (
    <SafeAreaView style={styles.screen}>
      <DotGrid />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>screenshots</Text>
        <View style={styles.headerDot} />
      </View>
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          keyExtractor={i => i}
          renderItem={({item}) => {
            const active = item === activeFilter;
            return (
              <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={() => setActiveFilter(item)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={i => i.id.toString()}
        renderItem={({item}) => <ScreenshotCard item={item} onPress={i => nav.navigate('ScreenshotDetail', {item: i})} onUpdate={updated => setItems(prev => prev.map(it => it.id === updated.id ? updated : it))} />}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: 'DM Mono', fontSize: 11, color: '#f0f0f0' },
  headerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f0f0f0' },
  filterBar: { marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a', backgroundColor: 'transparent' },
  chipActive: { borderColor: '#f0f0f0' },
  chipText: { fontFamily: 'DM Mono', fontSize: 10, color: '#666' },
  chipTextActive: { color: '#f0f0f0' },
  grid: { paddingHorizontal: 12, paddingBottom: 80 },
  row: { gap: 12, marginBottom: 12 },
  cardContainer: { flex: 1, backgroundColor: 'transparent' },
  shimmerContainer: { height: 80, backgroundColor: '#141414', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e1e1e' },
  shimmerText: { fontFamily: 'DM Mono', fontSize: 10, color: '#666', fontStyle: 'italic' },
  thumbnailContainer: { height: 52, borderRadius: 8, marginBottom: 8, overflow: 'hidden' },
  thumbnail: { width: '100%', height: '100%' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  badgeText: { fontFamily: 'DM Mono', fontSize: 8, fontWeight: '700' },
  cardTitle: { fontFamily: 'DM Sans', fontSize: 12, color: '#e0e0e0' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  fabIcon: { fontSize: 18, color: '#0a0a0a', marginTop: -2 }
});
