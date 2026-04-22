import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { C } from '../design/colors';
import { FeedCard } from '../components/FeedCard';
import { useCallback } from 'react';

const groupByDate = (items) => {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
  const yestStart  = new Date(todayStart); yestStart.setDate(todayStart.getDate() - 1);

  const groups = [
    { label: 'astazi',      items: [] },
    { label: 'ieri',        items: [] },
    { label: 'mai devreme', items: [] },
  ];

  for (const item of items) {
    const d = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
    d.setHours(0, 0, 0, 0);
    if (d >= todayStart)     groups[0].items.push(item);
    else if (d >= yestStart) groups[1].items.push(item);
    else                     groups[2].items.push(item);
  }

  return groups.filter(g => g.items.length > 0);
};

const DateDivider = ({ label }) => (
  <View style={s.dateDivider}>
    <Text style={s.dateDividerText}>{label}</Text>
    <View style={s.dateDividerLine} />
  </View>
);

export default function FeedScreen({ navigate }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError(false);
    try {
      const data = await itemsApi.getAllItems({});
      setItems(data.sort((a, b) => {
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

  const handlePress = (item) => {
    if (item.type === 'NOTE') {
      navigate('NoteEditor', { noteId: item.id });
    } else {
      navigate('ItemDetail', { item });
    }
  };

  const groups = groupByDate(items);

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={C.textDim}
        />
      }
    >
      <View style={s.titleWrap}>
        <Text style={s.title}>{'essential\nspace'}</Text>
        <Text style={s.sub}>
          {new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })}
          {' · '}
          {items.length} items din backend
        </Text>
      </View>

      <View style={s.overview}>
        <View style={s.metricCard}>
          <Text style={s.metricValue}>{items.length}</Text>
          <Text style={s.metricLabel}>total</Text>
        </View>
        <View style={s.metricCard}>
          <Text style={s.metricValue}>{items.filter(i => i.aiProcessed === false).length}</Text>
          <Text style={s.metricLabel}>processing</Text>
        </View>
        <View style={s.metricCard}>
          <Text style={s.metricValue}>{items.filter(i => i.type === 'NOTE').length}</Text>
          <Text style={s.metricLabel}>notes</Text>
        </View>
      </View>

      {loading && !refreshing && (
        <View style={s.stateBox}>
          <ActivityIndicator color={C.textPrimary} />
          <Text style={s.stateText}>incarc datele din backend...</Text>
        </View>
      )}

      {!loading && groups.map(group => (
        <View key={group.label}>
          <DateDivider label={group.label} />
          {group.items.map(item => (
            <FeedCard key={item.id} item={item} onPress={handlePress} />
          ))}
        </View>
      ))}

      {error && !loading && (
        <View style={s.stateBox}>
          <Text style={s.stateText}>nu pot contacta backend-ul</Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={s.retryBtn}>
            <Text style={s.retryText}>incearca din nou</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && !loading && items.length === 0 && (
        <View style={s.stateBox}>
          <Text style={s.stateText}>backend-ul raspunde, dar nu exista itemi inca</Text>
        </View>
      )}

      <View style={s.footerGap} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleWrap: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'DMSansBold',
    fontSize: 26,
    color: C.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 6,
  },
  sub: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 0.6,
  },
  overview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  metricCard: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.borderMedium,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  metricValue: {
    fontFamily: 'DMSansBold',
    fontSize: 20,
    color: C.textPrimary,
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    color: C.textSec,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  dateDividerText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    color: C.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.borderMedium,
  },
  stateBox: {
    marginTop: 60,
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
