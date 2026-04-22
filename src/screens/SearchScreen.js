import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { C } from '../design/colors';
import { FeedCard } from '../components/FeedCard';
import { IcSearch } from '../components/Icons';

export default function SearchScreen({ navigate }) {
  const [query, setQuery] = useState('');
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    itemsApi.getAllItems({})
      .then(data => setAll(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const q = query.trim().toLowerCase();
  const results = q
    ? all.filter(item => {
        const text = [item.title, item.content, item.url, ...(item.aiTags || [])]
          .filter(Boolean).join(' ').toLowerCase();
        return text.includes(q);
      })
    : all.slice(0, 6);

  const handlePress = (item) => {
    if (item.type === 'NOTE') navigate('NoteEditor', { noteId: item.id });
    else navigate('ItemDetail', { item });
  };

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.titleWrap}>
        <Text style={s.title}>search</Text>
        <Text style={s.sub}>
          toate · {all.length} items
        </Text>
      </View>

      <View style={s.searchBar}>
        <IcSearch c={C.textDark} size={16} />
        <TextInput
          style={s.input}
          placeholder="cauta in tot..."
          placeholderTextColor={C.textDark}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {loading && (
        <View style={s.stateBox}>
          <ActivityIndicator color={C.textPrimary} />
          <Text style={s.stateText}>incarc itemii pentru cautare...</Text>
        </View>
      )}

      {!loading && results.map(item => (
        <FeedCard key={item.id} item={item} onPress={handlePress} />
      ))}

      {!loading && q && results.length === 0 && (
        <View style={s.stateBox}>
          <Text style={s.stateText}>nu am gasit nimic pentru "{query}"</Text>
        </View>
      )}

      <View style={s.footerGap} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  titleWrap: { marginBottom: 24 },
  title: {
    fontFamily: 'DMSansBold',
    fontSize: 26,
    color: C.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  sub: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 0.6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.card,
    borderWidth: 0.5,
    borderColor: C.borderSubtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    color: C.textSec,
  },
  stateBox: {
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.borderMedium,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  stateText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    color: C.textSec,
    letterSpacing: 0.5,
  },
  footerGap: { height: 100 },
});
