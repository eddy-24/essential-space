import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { screenshotsApi } from '../services/api/screenshotsApi';
import { API_HOST } from '../services/api/client';

export default function ScreenshotDetailScreen() {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ocrExpanded, setOcrExpanded] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const fetchItem = useCallback(() => {
    screenshotsApi.getScreenshot(id)
      .then(data => { setItem(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useFocusEffect(fetchItem);

  const handleRetry = async () => {
    setLoading(true);
    try {
      await screenshotsApi.retryProcessing(id);
      fetchItem();
    } catch (e) {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await screenshotsApi.deleteScreenshot(id);
      navigation.goBack();
    } catch (e) {}
  };

  if (loading && !item) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator color="#f0f0f0" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!item) return null;

  let details = {};
  try { details = JSON.parse(item.detectedDetails || '{}'); } catch(e) {}
  
  let tags = [];
  try { tags = JSON.parse(item.aiTags || '[]'); } catch(e) {}

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.headerBtn}>back</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EditScreenshot', { id })}><Text style={styles.headerBtn}>edit</Text></TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image 
          source={{ uri: item.imageUrl.startsWith('/') ? `${API_HOST}${item.imageUrl}` : item.imageUrl }} 
          style={styles.imagePreview} 
          resizeMode="contain" 
        />
        
        {item.processingStatus === 'PROCESSING' && (
          <View style={styles.processingBanner}>
            <ActivityIndicator color="#f0f0f0" size="small" style={{ marginRight: 8 }} />
            <Text style={styles.processingText}>AI is currently analyzing this screenshot...</Text>
          </View>
        )}

        {item.processingStatus === 'FAILED' && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>Processing failed: {item.processingError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryBtnText}>Retry AI Processing</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.processingStatus === 'COMPLETED' && (
          <View style={styles.content}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.aiCategory}</Text>
            </View>
            <Text style={styles.title}>{item.generatedTitle || 'Untitled'}</Text>
            <Text style={styles.summary}>{item.aiSummary}</Text>

            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((t, i) => (
                  <View key={i} style={styles.tag}><Text style={styles.tagText}>#{t}</Text></View>
                ))}
              </View>
            )}

            {Object.keys(details).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detected Info</Text>
                {Object.entries(details).map(([k, v]) => (
                  <View key={k} style={styles.detailRow}>
                    <Text style={styles.detailKey}>{k}</Text>
                    <Text style={styles.detailValue}>{String(v)}</Text>
                  </View>
                ))}
              </View>
            )}

            {item.ocrText && (
              <View style={styles.section}>
                <TouchableOpacity onPress={() => setOcrExpanded(!ocrExpanded)}>
                  <Text style={styles.sectionTitle}>Extracted Text (OCR) {ocrExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>
                {ocrExpanded && (
                  <Text style={styles.ocrText}>{item.ocrText}</Text>
                )}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete Screenshot</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerBtn: { fontFamily: 'DM Mono', fontSize: 14, color: '#f0f0f0' },
  scroll: { paddingBottom: 40 },
  imagePreview: { width: '100%', height: 300, backgroundColor: '#111' },
  processingBanner: { flexDirection: 'row', padding: 16, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  processingText: { fontFamily: 'DM Mono', fontSize: 12, color: '#aaa' },
  errorBanner: { padding: 16, backgroundColor: '#2a0a0a' },
  errorText: { fontFamily: 'DM Mono', fontSize: 12, color: '#ff6b6b', marginBottom: 12 },
  retryBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ff6b6b', borderRadius: 4 },
  retryBtnText: { fontFamily: 'DM Sans', fontSize: 12, fontWeight: 'bold', color: '#0a0a0a' },
  content: { padding: 20 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#222', borderRadius: 6, marginBottom: 12 },
  categoryText: { fontFamily: 'DM Mono', fontSize: 10, color: '#ccc' },
  title: { fontFamily: 'DM Sans', fontSize: 24, fontWeight: 'bold', color: '#f0f0f0', marginBottom: 8 },
  summary: { fontFamily: 'DM Sans', fontSize: 15, color: '#aaa', lineHeight: 22, marginBottom: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#333' },
  tagText: { fontFamily: 'DM Mono', fontSize: 11, color: '#888' },
  section: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingTop: 16 },
  sectionTitle: { fontFamily: 'DM Mono', fontSize: 12, color: '#666', marginBottom: 12 },
  detailRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#141414' },
  detailKey: { flex: 1, fontFamily: 'DM Mono', fontSize: 12, color: '#888', textTransform: 'capitalize' },
  detailValue: { flex: 2, fontFamily: 'DM Sans', fontSize: 14, color: '#f0f0f0' },
  ocrText: { fontFamily: 'DM Mono', fontSize: 11, color: '#666', lineHeight: 18, backgroundColor: '#111', padding: 12, borderRadius: 8 },
  deleteBtn: { marginTop: 40, marginHorizontal: 20, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#331111', alignItems: 'center' },
  deleteBtnText: { fontFamily: 'DM Sans', fontSize: 14, color: '#ff6b6b', fontWeight: 'bold' },
});
