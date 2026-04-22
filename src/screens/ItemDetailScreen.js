import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { C } from '../design/colors';
import { DotGrid } from '../components/DotGrid';
import { IcBack } from '../components/Icons';
import { useStore } from '../store/useStore';
import { API_HOST } from '../services/api/client';
import { itemsApi } from '../services/api/itemsApi';

const BADGE_COLOR = {
  event:    { color: '#5ab4f0', bg: 'rgba(90,180,240,0.1)' },
  wishlist: { color: '#c080e0', bg: 'rgba(192,128,224,0.1)' },
  date:     { color: '#e0b060', bg: 'rgba(224,176,96,0.1)' },
  note:     { color: '#60c080', bg: 'rgba(96,192,128,0.1)' },
  link:     { color: C.typeLink, bg: 'rgba(100,210,255,0.1)' },
};

const TYPE_LABEL = {
  SCREENSHOT: 'image',
  LINK: 'link',
  NOTE: 'note',
  FILE: 'file',
};

const TYPE_COLOR = {
  SCREENSHOT: C.typeImage,
  LINK:       C.typeLink,
  NOTE:       C.typeNote,
  FILE:       C.typeFile,
};

const Block = ({ label, children }) => (
  <View style={s.block}>
    <Text style={s.blockLabel}>{label}</Text>
    {children}
  </View>
);

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { deleteItem } = useStore();
  const [currentItem, setCurrentItem] = useState(item);
  const [loading, setLoading] = useState(Boolean(item?.id));

  useEffect(() => {
    if (!item?.id) return;
    itemsApi.getItem(item.id)
      .then(setCurrentItem)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [item?.id]);

  const detailItem = currentItem || item;
  const typeLabel = TYPE_LABEL[detailItem.type] || detailItem.type?.toLowerCase() || 'item';
  const typeColor = TYPE_COLOR[detailItem.type] || C.typeNote;

  let imageUrl = detailItem.previewImage || detailItem.content;
  if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${API_HOST}${imageUrl}`;
  const showImage = detailItem.type === 'SCREENSHOT' && imageUrl;

  const detailText = [
    detailItem.note,
    detailItem.aiSummary,
    detailItem.ocrText,
  ].filter(Boolean).join('\n\n');

  const metadata = [
    { label: 'created', value: detailItem.createdAt ? new Date(detailItem.createdAt).toLocaleString('ro-RO') : null },
    { label: 'domain', value: detailItem.domain },
    { label: 'file', value: detailItem.fileName },
    { label: 'size', value: detailItem.fileSize ? `${detailItem.fileSize} bytes` : null },
  ].filter(entry => entry.value);

  const handleDelete = () => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(detailItem.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={s.screen}>
      <DotGrid />

      <SafeAreaView style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <IcBack />
          <Text style={s.backText}>back</Text>
        </TouchableOpacity>
        <Text style={[s.typeTag, { color: typeColor }]}>{typeLabel}</Text>
      </SafeAreaView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={s.loadingBox}>
            <ActivityIndicator color={C.textPrimary} />
            <Text style={s.loadingText}>sincronizez itemul cu backend-ul...</Text>
          </View>
        )}

        {showImage && (
          <View style={s.hero}>
            <Image source={{ uri: imageUrl }} style={s.heroImage} resizeMode="cover" />
            <View style={StyleSheet.absoluteFillObject}>
              <Svg width="100%" height="100%">
                <Defs>
                  <LinearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0.4" stopColor={C.bg} stopOpacity="0" />
                    <Stop offset="1" stopColor={C.bg} stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#heroFade)" />
              </Svg>
            </View>
          </View>
        )}

        {detailItem.aiCategory && (() => {
          const badgeKey = detailItem.aiCategory.toLowerCase();
          const badge = BADGE_COLOR[badgeKey];
          return (
            <View style={[s.badgePill, { backgroundColor: badge?.bg ?? 'rgba(240,237,230,0.06)' }]}>
              <Text style={[s.badgePillText, { color: badge?.color ?? C.textDim }]}>
                {badgeKey}
              </Text>
            </View>
          );
        })()}

        <Text style={s.mainTitle}>{detailItem.title || 'Untitled'}</Text>

        {(detailItem.content || detailItem.url) && (
          <Text style={s.summary}>{detailItem.content || detailItem.url}</Text>
        )}

        {detailText && (
          <Block label="details">
            <Text style={s.blockText}>{detailText}</Text>
          </Block>
        )}

        {metadata.length > 0 && (
          <Block label="metadata">
            <View style={s.metaList}>
              {metadata.map(entry => (
                <View key={entry.label} style={s.metaRow}>
                  <Text style={s.metaKey}>{entry.label}</Text>
                  <Text style={s.metaValue}>{entry.value}</Text>
                </View>
              ))}
            </View>
          </Block>
        )}

        {detailItem.richContent?.blocks?.length > 0 && (
          <Block label="rich content">
            <Text style={s.blockText}>
              {detailItem.richContent.blocks
                .map(block => block?.text)
                .filter(Boolean)
                .join('\n')}
            </Text>
          </Block>
        )}

        {(detailItem.aiTags?.length > 0 || detailItem.tags?.length > 0) && (
          <Block label="tags">
            <View style={s.tagsRow}>
              {[...(detailItem.aiTags || []), ...(detailItem.tags || [])].map((t, i) => (
                <View key={`${t}-${i}`} style={s.tagChip}>
                  <Text style={s.tagChipText}>{t}</Text>
                </View>
              ))}
            </View>
          </Block>
        )}

        <TouchableOpacity style={s.actionBtn} onPress={handleDelete}>
          <Text style={[s.actionBtnText, { color: C.danger }]}>delete item</Text>
        </TouchableOpacity>

        <View style={s.footerGap} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 14,
    zIndex: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  backText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: C.textMuted,
  },
  typeTag: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 48 },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.borderMedium,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  loadingText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: C.textSec,
  },
  hero: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: C.elevated,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgePillText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontFamily: 'DMSansMedium',
    fontSize: 20,
    color: C.textPrimary,
    lineHeight: 26,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  summary: {
    fontFamily: 'DMSansRegular',
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 21,
    marginBottom: 18,
  },
  block: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.borderMedium,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  blockLabel: {
    fontFamily: 'DMMonoRegular',
    fontSize: 8,
    color: C.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  blockText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    color: C.textSec,
    lineHeight: 18,
  },
  metaList: {
    gap: 10,
  },
  metaRow: {
    gap: 4,
  },
  metaKey: {
    fontFamily: 'DMMonoRegular',
    fontSize: 8,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaValue: {
    fontFamily: 'DMSansRegular',
    fontSize: 13,
    color: C.textPrimary,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: C.borderMedium,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: C.elevated,
  },
  tagChipText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    color: C.textSec,
  },
  actionBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borderMedium,
    backgroundColor: C.elevated,
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtnText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  footerGap: { height: 40 },
});
