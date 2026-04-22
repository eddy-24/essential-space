import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Image, Linking, SafeAreaView, Alert, LayoutAnimation } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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

export default function LinksScreen() {
  const [sections, setSections] = useState([]);

  const fetchLinks = useCallback(() => {
    itemsApi.getLinksByDomain().then(data => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSections(data.map(g => ({ ...g, data: g.items || [] })));
    }).catch(() => {});
  }, []);

  useFocusEffect(fetchLinks);

  const handleDelete = (id) => {
    Alert.alert('Delete Link', 'Are you sure you want to delete this link?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await itemsApi.deleteItem(id);
            fetchLinks();
          } catch (e) {}
      }}
    ]);
  };

  const renderHeader = ({ section }) => {
    return (
      <View style={styles.domainHeader}>
        <View style={styles.domainInitial}>
           <Text style={styles.domainInitialText}>{section.domain.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.domainName}>{section.domain}</Text>
        <View style={styles.domainCountWrapper}>
          <Text style={styles.domainCount}>{section.count}</Text>
        </View>
      </View>
    );
  };

  const renderCard = ({ item, index, section }) => {
    let coverImage = item.imageUrl || item.previewImage;
    if (coverImage && coverImage.startsWith('/')) coverImage = `${API_HOST}${coverImage}`;
    const isLast = index === section.data.length - 1;

    return (
      <TouchableOpacity 
        style={[styles.card, isLast && { borderBottomWidth: 0 }]} 
        onPress={() => item.content && Linking.openURL(item.content)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.cardThumb}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.cardImage} />
          ) : (
            <Text style={styles.thumbInitialText}>{(item.domain || '?').charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title || item.content}</Text>
          <View style={styles.tagsContainer}>
            {item.aiProcessed === false ? (
              <View style={styles.shimmerBar} />
            ) : (
              (item.aiTags || []).map((t, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <DotGrid />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>links</Text>
        <View style={styles.headerDot} />
      </View>
      <SectionList
        sections={sections}
        keyExtractor={i => i.id.toString()}
        renderItem={renderCard}
        renderSectionHeader={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState type="links" message="No links saved yet. Tap + to save one." />}
      />
      <GlobalFab onUploadSuccess={fetchLinks} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'DM Sans', fontSize: 22, fontWeight: '600', color: '#f0f0f0', letterSpacing: -0.4 },
  headerDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: '#f0f0f0' },
  list: { paddingHorizontal: 14, paddingBottom: 40 },
  domainHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 28, marginBottom: 10, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  domainInitial: { width: 18, height: 18, borderRadius: 4, backgroundColor: '#1a1a1a', borderWidth: 0.5, borderColor: '#272727', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  domainInitialText: { fontFamily: 'DM Mono', fontSize: 8, color: '#555' },
  domainName: { fontFamily: 'DM Mono', fontSize: 10, color: '#666', flex: 1 },
  domainCountWrapper: { backgroundColor: '#161616', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  domainCount: { fontFamily: 'DM Mono', fontSize: 9, color: '#2a2a2a' },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#141414' },
  cardThumb: { width: 32, height: 24, backgroundColor: '#161616', borderWidth: 0.5, borderColor: '#1e1e1e', borderRadius: 4, marginRight: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  thumbInitialText: { fontFamily: 'DM Mono', fontSize: 9, color: '#333' },
  cardImage: { width: '100%', height: '100%' },
  cardContent: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontFamily: 'DM Sans', fontSize: 12, color: '#d0d0d0', marginBottom: 6 },
  tagsContainer: { flexDirection: 'row', gap: 6 },
  tagChip: { borderWidth: 0.5, borderColor: '#222', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
  tagText: { fontFamily: 'DM Mono', fontSize: 8, color: '#333' },
  shimmerBar: { width: 60, height: 12, backgroundColor: '#161616', borderRadius: 4 },
});
