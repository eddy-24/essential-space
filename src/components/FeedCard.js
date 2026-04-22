import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { C } from '../design/colors';
import { API_HOST } from '../services/api/client';
import { ThImage, ThLink, ThDoc, ThNote } from './Icons';

const TYPE_COLOR = {
  SCREENSHOT: C.typeImage,
  LINK:       C.typeLink,
  NOTE:       C.typeNote,
  FILE:       C.typeFile,
};

const TYPE_LABEL = {
  SCREENSHOT: 'image',
  LINK:       'link',
  NOTE:       'note',
  FILE:       'file',
};

const BADGE_COLOR = {
  event:    { color: '#5ab4f0', bg: 'rgba(90,180,240,0.1)' },
  wishlist: { color: '#c080e0', bg: 'rgba(192,128,224,0.1)' },
  date:     { color: '#e0b060', bg: 'rgba(224,176,96,0.1)' },
  note:     { color: C.typeLink,  bg: 'rgba(100,210,255,0.1)' },
};

export const relTime = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return 'acum';
  if (mins < 60) return `acum ${mins}m`;
  if (hrs  < 24) return `acum ${hrs}h`;
  if (days === 1) return 'ieri';
  if (days < 7)  return `${days} zile`;
  return `${Math.floor(days / 7)} săpt.`;
};

const cleanText = (value) => {
  if (!value) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

const getItemTitle = (item, typeKey) => {
  if (cleanText(item.title)) return cleanText(item.title);
  if (typeKey === 'LINK' && cleanText(item.domain)) return cleanText(item.domain);
  if ((typeKey === 'FILE' || typeKey === 'SCREENSHOT') && cleanText(item.fileName)) {
    return cleanText(item.fileName);
  }
  if (typeKey === 'NOTE') return 'Quick note';
  if (typeKey === 'SCREENSHOT') return 'Screenshot';
  if (typeKey === 'FILE') return 'File upload';
  return 'Untitled';
};

const getItemPreview = (item, typeKey) => {
  const richPreview = item.richContent?.blocks
    ?.map(block => cleanText(block.text))
    .filter(Boolean)
    .join(' ');

  if (cleanText(item.aiSummary)) return cleanText(item.aiSummary);
  if (typeKey === 'SCREENSHOT' && cleanText(item.ocrText)) return cleanText(item.ocrText);
  if (typeKey === 'NOTE' && richPreview) return richPreview;
  if (cleanText(item.note)) return cleanText(item.note);
  if (typeKey === 'FILE' && item.fileSize) return `${item.fileSize} bytes`;
  if (cleanText(item.content) && !String(item.content).startsWith('/uploads/')) return cleanText(item.content);
  return '';
};

const ThumbIcon = ({ type }) => {
  const c = C.textPrimary;
  switch (type) {
    case 'LINK':  return <ThLink c={c} />;
    case 'FILE':  return <ThDoc c={c} />;
    case 'NOTE':  return <ThNote c={c} />;
    default:      return <ThImage c={c} />;
  }
};

export const FeedCard = ({ item, onPress }) => {
  if (!item) return null;

  const typeKey   = item.type || 'NOTE';
  const color     = TYPE_COLOR[typeKey] || C.typeNote;
  const label     = TYPE_LABEL[typeKey] || typeKey.toLowerCase();
  const badgeKey  = item.aiCategory?.toLowerCase();
  const badge     = badgeKey && BADGE_COLOR[badgeKey];

  let thumbUri = null;
  if (typeKey === 'SCREENSHOT' && item.previewImage) {
    thumbUri = item.previewImage.startsWith('/')
      ? `${API_HOST}${item.previewImage}`
      : item.previewImage;
  }

  const showThumb = typeKey !== 'NOTE';
  const title   = getItemTitle(item, typeKey);
  const preview = getItemPreview(item, typeKey);
  const tags    = item.aiTags || item.tags || [];
  const time    = relTime(item.createdAt);
  const isProcessing = item.aiProcessed === false;

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={() => onPress?.(item)}>
      <View style={s.cardTop}>
        <View style={s.dotWrap}>
          <View style={[s.dot, { backgroundColor: color }]} />
        </View>

        <View style={s.body}>
          <View style={s.meta}>
            <Text style={[s.typeLabel, { color }]}>{label}</Text>
            {isProcessing && (
              <View style={s.processingPill}>
                <Text style={s.processingText}>processing</Text>
              </View>
            )}
            {badge && (
              <View style={[s.badge, { backgroundColor: badge.bg }]}>
                <Text style={[s.badgeText, { color: badge.color }]}>{badgeKey}</Text>
              </View>
            )}
            <Text style={s.time}>{time}</Text>
          </View>

          {title ? (
            <Text style={s.title} numberOfLines={2}>{title}</Text>
          ) : null}

          {preview ? (
            <Text style={s.preview} numberOfLines={2}>{preview}</Text>
          ) : null}

          {tags.length > 0 && (
            <View style={s.tags}>
              {tags.slice(0, 5).map((t, i) => (
                <View key={i} style={s.tag}>
                  <Text style={s.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {showThumb && (
          <View style={s.thumb}>
            {thumbUri ? (
              <Image source={{ uri: thumbUri }} style={s.thumbImg} />
            ) : (
              <ThumbIcon type={typeKey} />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.borderMedium,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dotWrap: {
    marginTop: 3,
    flexShrink: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 7,
  },
  typeLabel: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  processingPill: {
    backgroundColor: 'rgba(240, 237, 232, 0.08)',
    borderWidth: 1,
    borderColor: C.borderMedium,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  processingText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 8,
    color: C.textSec,
    letterSpacing: 0.6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  badgeText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 8,
    letterSpacing: 0.8,
  },
  time: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    color: C.textMuted,
    marginLeft: 'auto',
  },
  title: {
    fontFamily: 'DMSansMedium',
    fontSize: 15,
    color: C.textPrimary,
    lineHeight: 21,
    marginBottom: 5,
  },
  preview: {
    fontFamily: 'DMSansRegular',
    fontSize: 12,
    color: C.textSec,
    lineHeight: 18,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    borderWidth: 1,
    borderColor: C.borderMedium,
    backgroundColor: C.elevated,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 8,
    color: C.textSec,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#201f1d',
    flexShrink: 0,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
});
