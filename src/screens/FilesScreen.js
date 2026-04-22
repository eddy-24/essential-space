import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Linking, Alert } from 'react-native';
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

const getExtColor = (ext) => {
  const e = ext ? ext.toUpperCase() : '';
  if (e === 'PDF') return '#FF3B30';
  if (e === 'FIG') return '#BF5AF2';
  if (e === 'SQL') return '#30D158';
  if (e === 'MP4') return '#FF9F0A';
  return '#888';
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function FilesScreen() {
  const [files, setFiles] = useState([]);
  const nav = useNavigation();

  useFocusEffect(useCallback(() => {
    itemsApi.getAllItems({ type: 'FILE' }).then(data => {
      setFiles(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }).catch(() => {});
  }, []));

  const handleDelete = (id) => {
    Alert.alert('Delete File', 'Are you sure you want to delete this file?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await itemsApi.deleteItem(id);
            setFiles(prev => prev.filter(f => f.id !== id));
          } catch (e) {}
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <DotGrid />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>files</Text>
        <View style={styles.headerDot} />
      </View>
      <FlatList
        data={files}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({item, index}) => {
          const isLast = index === files.length - 1;
          const extMatch = item.content ? item.content.match(/\.([a-zA-Z0-9]+)$/) : null;
          let ext = extMatch ? extMatch[1].toUpperCase() : 'FILE';
          if (ext.length > 3) ext = ext.substring(0, 3);
          
          return (
            <TouchableOpacity 
              style={[styles.card, isLast && { borderBottomWidth: 0 }]}
              onPress={() => {
                if (item.content) {
                  const url = item.content.startsWith('/') ? `${API_HOST}${item.content}` : item.content;
                  Linking.openURL(url);
                }
              }}
              onLongPress={() => handleDelete(item.id)}
            >
              <View style={styles.fileIconBox}>
                <Text style={[styles.extText, { color: getExtColor(ext) }]}>{ext}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.fileName} numberOfLines={1}>{item.title || item.content.split('/').pop() || 'Untitled'}</Text>
                <Text style={styles.fileMeta}>{formatSize(item.fileSize)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'DM Sans', fontSize: 22, fontWeight: '600', color: '#f0f0f0', letterSpacing: -0.4 },
  headerDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: '#f0f0f0' },
  list: { paddingHorizontal: 14, paddingBottom: 80 },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#141414' },
  fileIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#161616', borderWidth: 0.5, borderColor: '#1e1e1e', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  extText: { fontFamily: 'DM Mono', fontSize: 8, fontWeight: 'bold', letterSpacing: 0.5 },
  cardContent: { flex: 1, justifyContent: 'center' },
  fileName: { fontFamily: 'DM Sans', fontSize: 12, color: '#c8c8c8', marginBottom: 4 },
  fileMeta: { fontFamily: 'DM Mono', fontSize: 9, color: '#333' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  fabIcon: { fontSize: 18, color: '#0a0a0a', marginTop: -2 }
});
