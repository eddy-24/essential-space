import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { screenshotsApi } from '../services/api/screenshotsApi';
import { API_HOST } from '../services/api/client';
import { GlobalFab } from '../components/GlobalFab';

const CATEGORIES = ['ALL', 'EVENT', 'WISHLIST', 'DATE', 'NOTE', 'LINK', 'OTHER'];

export default function HomeScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const navigation = useNavigation();

  const fetchItems = useCallback(() => {
    const params = {};
    if (search) params.q = search;
    if (activeCategory !== 'ALL') params.category = activeCategory;

    screenshotsApi.getScreenshots(params)
      .then(data => { setItems(data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, [search, activeCategory]);

  useFocusEffect(fetchItems);

  const renderCard = ({ item }) => {
    const isProcessing = item.processingStatus === 'PROCESSING';
    const isFailed = item.processingStatus === 'FAILED';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('ScreenshotDetail', { id: item.id })}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.imageUrl.startsWith('/') ? `${API_HOST}${item.imageUrl}` : item.imageUrl }} 
          style={styles.cardThumb} 
          resizeMode="cover" 
        />
        <View style={styles.cardContent}>
          {isProcessing ? (
            <View style={styles.processingState}>
              <ActivityIndicator color="#f0f0f0" size="small" style={{ marginRight: 8 }} />
              <Text style={styles.processingText}>Analyzing...</Text>
            </View>
          ) : (
            <>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, isFailed && { backgroundColor: '#331111' }]}>
                  <Text style={[styles.badgeText, isFailed && { color: '#ff6b6b' }]}>
                    {isFailed ? 'FAILED' : item.aiCategory}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.generatedTitle || (isFailed ? 'Processing Failed' : 'Untitled')}
              </Text>
              <Text style={styles.cardSummary} numberOfLines={2}>
                {item.aiSummary || (isFailed ? item.processingError : 'No summary available.')}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Screenshots</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchItems}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={c => c}
          renderItem={({ item: c }) => (
            <TouchableOpacity 
              style={[styles.filterChip, activeCategory === c && styles.filterChipActive]}
              onPress={() => setActiveCategory(c)}
            >
              <Text style={[styles.filterText, activeCategory === c && styles.filterTextActive]}>{c}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchItems}
        ListEmptyComponent={<Text style={styles.emptyText}>No screenshots found.</Text>}
      />

      <GlobalFab onUploadSuccess={fetchItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16 },
  headerTitle: { fontFamily: 'DM Sans', fontSize: 28, fontWeight: 'bold', color: '#f0f0f0' },
  searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
  searchInput: { backgroundColor: '#141414', borderRadius: 8, padding: 12, color: '#f0f0f0', fontFamily: 'DM Sans', fontSize: 16 },
  filtersContainer: { marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#141414', marginRight: 8 },
  filterChipActive: { backgroundColor: '#f0f0f0' },
  filterText: { fontFamily: 'DM Mono', fontSize: 12, color: '#888' },
  filterTextActive: { color: '#0a0a0a', fontWeight: 'bold' },
  list: { padding: 16, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: '#111111', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 0.5, borderColor: '#1e1e1e' },
  cardThumb: { width: 80, height: 100, backgroundColor: '#1a1a1a' },
  cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  processingState: { flexDirection: 'row', alignItems: 'center' },
  processingText: { fontFamily: 'DM Mono', fontSize: 12, color: '#aaa' },
  cardHeader: { marginBottom: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#222', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontFamily: 'DM Mono', fontSize: 9, color: '#aaa' },
  cardTitle: { fontFamily: 'DM Sans', fontSize: 16, fontWeight: '600', color: '#f0f0f0', marginBottom: 4 },
  cardSummary: { fontFamily: 'DM Sans', fontSize: 13, color: '#888' },
  emptyText: { fontFamily: 'DM Sans', fontSize: 14, color: '#666', textAlign: 'center', marginTop: 40 },
});
