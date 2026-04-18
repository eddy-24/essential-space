import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const nav = useNavigation();

  useFocusEffect(useCallback(() => {
    itemsApi.getAllItems({ type: 'NOTE' }).then(data => {
      setNotes(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }).catch(() => {});
  }, []));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>notes</Text>
      </View>
      <FlatList
        data={notes}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.card} onPress={() => nav.navigate('NoteEditor', { noteId: item.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Untitled Note'}</Text>
              {item.linkedItemId && <View style={styles.attachDot} />}
            </View>
            <Text style={styles.previewText} numberOfLines={2}>{item.content || '...'}</Text>
            <View style={styles.tagsContainer}>
              {(item.aiTags || []).map((t, i) => (
                <View key={i} style={styles.dashedChip}>
                  <Text style={styles.dashedChipText}>{t}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => nav.navigate('NoteEditor')}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  headerTitle: { fontFamily: 'DM Mono', fontSize: 11, color: '#f0f0f0' },
  list: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#141414', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#1e1e1e' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontFamily: 'DM Sans', fontSize: 12, color: '#e0e0e0', flex: 1 },
  attachDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#c080e0' },
  previewText: { fontFamily: 'DM Sans', fontSize: 10, color: '#555', marginBottom: 8, lineHeight: 14 },
  tagsContainer: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dashedChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: '#333', borderStyle: 'dashed' },
  dashedChipText: { fontFamily: 'DM Mono', fontSize: 8, color: '#444' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  fabIcon: { fontSize: 18, color: '#0a0a0a', marginTop: -2 }
});
