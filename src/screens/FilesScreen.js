import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { C } from '../design/colors';
import { FeedCard } from '../components/FeedCard';

export default function FilesScreen({ navigate }) {
  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError(false);
    try {
      const data = await itemsApi.getAllItems({ type: 'FILE' });
      setFiles(data.sort((a, b) => {
        const da = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const db = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return db - da;
      }));
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.textDim} />
      }
    >
      <View style={s.titleWrap}>
        <Text style={s.title}>files</Text>
        <Text style={s.sub}>{files.length} fisiere</Text>
      </View>

      {loading && !refreshing && (
        <View style={s.stateBox}>
          <ActivityIndicator color={C.textPrimary} />
          <Text style={s.stateText}>incarc fisierele...</Text>
        </View>
      )}

      {!loading && files.map(item => (
        <FeedCard
          key={item.id}
          item={item}
          onPress={() => navigate('ItemDetail', { item })}
        />
      ))}

      {error && !loading && (
        <View style={s.stateBox}>
          <Text style={s.stateText}>nu pot incarca fisierele din backend</Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={s.retryBtn}>
            <Text style={s.retryText}>incearca din nou</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && !loading && files.length === 0 && (
        <View style={s.stateBox}>
          <Text style={s.stateText}>nu exista fisiere in backend inca</Text>
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
  retryBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  retryText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: C.textPrimary,
  },
  footerGap: { height: 100 },
});
