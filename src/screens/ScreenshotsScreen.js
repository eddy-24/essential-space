import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { API_HOST } from '../services/api/client';
import { GlobalFab } from '../components/GlobalFab';
import { EmptyState } from '../components/EmptyState';
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

const ScreenshotCard = ({ item, onPress, onUpdate, onDelete }) => {
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

  const handleDelete = () => {
    Alert.alert('Delete Screenshot', 'Are you sure you want to delete this screenshot?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await itemsApi.deleteItem(localItem.id);
            onDelete(localItem.id);
          } catch (e) {}
      }}
    ]);
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={() => onPress(localItem)}
      onLongPress={handleDelete}
    >
      {localItem.aiProcessed === false ? (
        <View style={styles.cardContainer}>
          <View style={[styles.thumbnailContainer, { backgroundColor: '#161616' }]} />
          <View style={styles.metaSection}>
            <View style={{ height: 10, backgroundColor: '#1a1a1a', borderRadius: 4, width: '40%', marginBottom: 6 }} />
            <View style={{ height: 12, backgroundColor: '#161616', borderRadius: 4, width: '80%' }} />
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.thumbnailContainer, { backgroundColor: cStyles.bg }]}>
             {imageUrl ? (
               <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
             ) : (
               <Text style={[styles.thumbCatText, { color: cStyles.color }]}>{cat}</Text>
             )}
          </View>
          <View style={styles.metaSection}>
            <View style={[styles.badge, { backgroundColor: cStyles.bg }]}>
              <Text style={[styles.badgeText, { color: cStyles.color }]}>{cat}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{localItem.title || 'Untitled'}</Text>
          </View>
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
          contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
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
        renderItem={({item}) => <ScreenshotCard item={item} onPress={i => nav.navigate('ScreenshotDetail', {item: i})} onUpdate={updated => setItems(prev => prev.map(it => it.id === updated.id ? updated : it))} onDelete={id => setItems(prev => prev.filter(it => it.id !== id))} />}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={<EmptyState type="shots" message="No screenshots captured yet. Tap + to add one." />}
      />
      <GlobalFab onUploadSuccess={() => itemsApi.getAllItems({ type: 'SCREENSHOT' }).then(setItems).catch(() => {})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'DM Sans', fontSize: 22, fontWeight: '600', color: '#f0f0f0', letterSpacing: -0.4 },
  headerDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: '#f0f0f0' },
  filterBar: { marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 0.5, borderColor: '#2a2a2a', backgroundColor: 'transparent' },
  chipActive: { borderColor: '#f0f0f0' },
  chipText: { fontFamily: 'DM Mono', fontSize: 10, color: '#666' },
  chipTextActive: { color: '#f0f0f0' },
  grid: { paddingHorizontal: 14, paddingBottom: 80 },
  row: { gap: 12, marginBottom: 12 },
  cardContainer: { flex: 1, backgroundColor: '#111111', borderRadius: 12, borderWidth: 0.5, borderColor: '#1e1e1e', overflow: 'hidden' },
  shimmerContainer: { height: 110, backgroundColor: '#141414', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#1e1e1e' },
  shimmerText: { fontFamily: 'DM Mono', fontSize: 10, color: '#666', fontStyle: 'italic' },
  thumbnailContainer: { height: 72, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  thumbnail: { width: '100%', height: '100%' },
  thumbCatText: { fontFamily: 'DM Mono', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.5 },
  metaSection: { padding: 10 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 6 },
  badgeText: { fontFamily: 'DM Mono', fontSize: 7, fontWeight: '700' },
  cardTitle: { fontFamily: 'DM Sans', fontSize: 11, color: '#c8c8c8', lineHeight: 15.4 },
});
