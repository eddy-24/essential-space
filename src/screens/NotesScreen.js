import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, LayoutAnimation } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { GlobalFab } from '../components/GlobalFab';
import { EmptyState } from '../components/EmptyState';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const nav = useNavigation();

  useFocusEffect(useCallback(() => {
    itemsApi.getAllItems({ type: 'NOTE' }).then(data => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotes(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }).catch(() => {});
  }, []));

  const handleDelete = (id) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await itemsApi.deleteItem(id);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setNotes(prev => prev.filter(n => n.id !== id));
          } catch (e) {}
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>notes</Text>
        <View style={styles.headerDot} />
      </View>
      <FlatList
        data={notes}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => nav.navigate('NoteEditor', { noteId: item.id })}
            onLongPress={() => handleDelete(item.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Untitled Note'}</Text>
              {item.linkedItemId && <View style={styles.attachDot} />}
            </View>
            <Text style={styles.previewText} numberOfLines={2}>{item.content || '...'}</Text>
            <View style={styles.tagsContainer}>
              {(item.aiTags || []).map((t, i) => (
                <View key={i} style={styles.solidChip}>
                  <Text style={styles.solidChipText}>{t}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState type="notes" message="No notes yet. Tap + to write something." />}
      />
      <GlobalFab onUploadSuccess={() => itemsApi.getAllItems({ type: 'NOTE' }).then(data => setNotes(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)))).catch(() => {})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'DM Sans', fontSize: 22, fontWeight: '600', color: '#f0f0f0', letterSpacing: -0.4 },
  headerDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: '#f0f0f0' },
  list: { paddingHorizontal: 14, paddingBottom: 80 },
  card: { backgroundColor: '#0e0e0e', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#1a1a1a' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontFamily: 'DM Sans', fontSize: 13, fontWeight: '500', color: '#d8d8d8', flex: 1 },
  attachDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#444' },
  previewText: { fontFamily: 'DM Sans', fontSize: 11, color: '#3a3a3a', marginBottom: 8, lineHeight: 17.6 },
  tagsContainer: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  solidChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#1e1e1e' },
  solidChipText: { fontFamily: 'DM Mono', fontSize: 9, color: '#aaa' },
});
