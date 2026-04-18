import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Image, Linking, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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

export default function LinksScreen() {
  const [sections, setSections] = useState([]);

  useFocusEffect(useCallback(() => {
    itemsApi.getLinksByDomain().then(data => {
      setSections(data.map(g => ({ ...g, data: g.items || [] })));
    }).catch(() => {});
  }, []));

  const renderHeader = ({ section }) => {
    let iconBg = '#1e1e1e';
    let iconColor = '#666';
    if (section.domain.includes('youtube')) { iconBg = '#2e1a1a'; iconColor = '#e05050'; }
    if (section.domain.includes('instagram')) { iconBg = '#2e1a2a'; iconColor = '#c060a0'; }

    return (
      <View style={styles.domainHeader}>
        <View style={[styles.domainIcon, { backgroundColor: iconBg }]}>
           <Text style={{ color: iconColor, fontSize: 8 }}>{section.domain.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.domainName}>{section.domain}</Text>
        <Text style={styles.domainCount}>{section.count}</Text>
      </View>
    );
  };

  const renderCard = ({ item }) => {
    let coverImage = item.imageUrl || item.previewImage;
    if (coverImage && coverImage.startsWith('/')) coverImage = `${API_HOST}${coverImage}`;

    return (
      <TouchableOpacity style={styles.card} onPress={() => item.url && Linking.openURL(item.url)}>
        <View style={styles.cardThumb}>
          {coverImage ? <Image source={{ uri: coverImage }} style={styles.cardImage} /> : null}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title || item.url}</Text>
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
      </View>
      <SectionList
        sections={sections}
        keyExtractor={i => i.id.toString()}
        renderItem={renderCard}
        renderSectionHeader={renderHeader}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  headerTitle: { fontFamily: 'DM Mono', fontSize: 11, color: '#f0f0f0' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  domainHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  domainIcon: { width: 12, height: 12, borderRadius: 2, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  domainName: { fontFamily: 'DM Mono', fontSize: 10, color: '#888', flex: 1 },
  domainCount: { fontFamily: 'DM Mono', fontSize: 10, color: '#444' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', padding: 8, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#1e1e1e' },
  cardThumb: { width: 28, height: 20, backgroundColor: '#222', borderRadius: 4, marginRight: 12, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'DM Sans', fontSize: 12, color: '#e0e0e0', marginBottom: 4 },
  tagsContainer: { flexDirection: 'row', gap: 6 },
  tagChip: { backgroundColor: '#1e1e1e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontFamily: 'DM Mono', fontSize: 8, color: '#888' },
  shimmerBar: { width: 60, height: 12, backgroundColor: '#2a2a2a', borderRadius: 4 },
});
