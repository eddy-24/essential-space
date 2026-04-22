import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { C } from '../design/colors';
import { DotGrid } from '../components/DotGrid';
import { IcBack, IcLink, IcCheck } from '../components/Icons';

const TOOLBAR = ['H1', 'H2', 'B', 'I', '—', '☑', 'link'];

const getBlockStyle = (type) => {
  switch (type) {
    case 'h1':       return { fontSize: 20, fontFamily: 'DMSansMedium', color: C.textPrimary };
    case 'h2':       return { fontSize: 16, fontFamily: 'DMSansMedium', color: C.textPrimary };
    case 'bullet':   return { fontSize: 15, fontFamily: 'DMSansRegular', color: C.textSec };
    case 'checkbox': return { fontSize: 15, fontFamily: 'DMSansRegular', color: C.textSec };
    default:         return { fontSize: 15, fontFamily: 'DMSansRegular', color: C.textSec };
  }
};

export default function NoteEditorScreen() {
  const route = useRoute();
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { noteId, linkedItemId } = route.params || {};
  const inputRefs = useRef([]);

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([{ type: 'paragraph', text: '' }]);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [linkedItem, setLinkedItem] = useState(null);
  const [aiTags, setAiTags] = useState([]);
  const [confirmedTags, setConfirmedTags] = useState([]);

  useEffect(() => {
    if (!noteId) return;
    itemsApi.getItem(noteId).then(item => {
      setTitle(item.title || '');
      if (item.richContent?.blocks?.length) setBlocks(item.richContent.blocks);
      else if (item.content) setBlocks([{ type: 'paragraph', text: item.content }]);
      setAiTags(item.aiTags || []);
      setConfirmedTags(item.tags || item.aiTags || []);
      if (item.linkedItemId) {
        itemsApi.getItem(item.linkedItemId).then(setLinkedItem).catch(() => {});
      }
    }).catch((err) => {
      Alert.alert('Error', err?.message || 'Could not load note.');
    });
  }, [noteId]);

  useEffect(() => {
    if (noteId || !linkedItemId) return;
    itemsApi.getItem(linkedItemId).then(setLinkedItem).catch(() => {});
  }, [linkedItemId, noteId]);

  const save = async () => {
    const payload = {
      type: 'NOTE',
      title,
      content: blocks.map(b => b.text).join('\n'),
      richContent: { version: 1, blocks },
      linkedItemId: linkedItem?.id,
      tags: confirmedTags,
    };
    try {
      if (noteId) await itemsApi.updateItem(noteId, payload);
      else await itemsApi.createItem(payload);
      nav.goBack();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Could not save note. Check backend connection.');
    }
  };

  const applyBlock = (type) => {
    setBlocks(prev => {
      const nb = [...prev];
      nb[focusedIdx] = { ...nb[focusedIdx], type };
      return nb;
    });
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Enter') {
      const nb = [...blocks];
      nb.splice(idx + 1, 0, { type: 'paragraph', text: '' });
      setBlocks(nb);
      setFocusedIdx(idx + 1);
      setTimeout(() => inputRefs.current[idx + 1]?.focus(), 50);
    } else if (e.nativeEvent.key === 'Backspace' && blocks[idx].text === '' && idx > 0) {
      const nb = [...blocks];
      nb.splice(idx, 1);
      setBlocks(nb);
      setFocusedIdx(idx - 1);
      setTimeout(() => inputRefs.current[idx - 1]?.focus(), 50);
    }
  };

  const toggleCheck = (idx) => {
    setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, checked: !b.checked } : b));
  };

  const toggleTag = (tag) => {
    setConfirmedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <View style={s.screen}>
      <DotGrid />
      <View style={[s.header, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <IcBack />
          <Text style={s.backText}>back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={save}>
          <Text style={s.saveText}>save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Toolbar */}
        <ScrollView
          horizontal
          style={s.toolbar}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.toolbarContent}
          keyboardShouldPersistTaps="always"
        >
          {TOOLBAR.map(btn => (
            <TouchableOpacity
              key={btn}
              style={s.tb}
              onPress={() => {
                const map = { H1: 'h1', H2: 'h2', '☑': 'checkbox', '—': 'bullet' };
                if (map[btn]) applyBlock(map[btn]);
              }}
            >
              <Text style={s.tbText}>{btn}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={s.editorScroll}
          contentContainerStyle={[s.editorContent, s.editorContentGrow]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.editorCard}>
            <Text style={s.editorLabel}>note</Text>

            <TextInput
              style={s.titleInput}
              placeholder="Note title..."
              placeholderTextColor={C.textMuted}
              value={title}
              onChangeText={setTitle}
              selectionColor={C.textPrimary}
              autoFocus={!noteId}
            />

            {!noteId && title.length === 0 && blocks.every(block => !block.text) && (
              <View style={s.emptyHint}>
                <Text style={s.emptyHintLabel}>quick note</Text>
                <Text style={s.emptyHintText}>scrie titlul sau incepe direct in primul bloc.</Text>
              </View>
            )}

            {/* Blocks */}
            {blocks.map((block, idx) => (
              <View key={idx} style={s.blockRow}>
                {block.type === 'bullet' && (
                  <Text style={s.bulletDash}>—</Text>
                )}
                {block.type === 'checkbox' && (
                  <TouchableOpacity
                    style={[s.checkbox, block.checked && s.checkboxDone]}
                    onPress={() => toggleCheck(idx)}
                  >
                    {block.checked && <IcCheck size={10} />}
                  </TouchableOpacity>
                )}
                <TextInput
                  ref={el => { inputRefs.current[idx] = el; }}
                  style={[s.blockInput, getBlockStyle(block.type),
                    block.checked && { textDecorationLine: 'line-through', color: C.textDark }]}
                  value={block.text}
                  onChangeText={txt => {
                    setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, text: txt } : b));
                  }}
                  onFocus={() => setFocusedIdx(idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                  multiline
                  placeholder={idx === 0 && !noteId ? 'Start writing...' : 'Continue writing...'}
                  placeholderTextColor={C.textMuted}
                  selectionColor={C.textPrimary}
                />
              </View>
            ))}
          </View>

          {/* Linked item */}
          {linkedItem && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>attached to</Text>
              <View style={s.attachedPill}>
                <IcLink c="#5ab4f0" size={12} />
                <Text style={s.attachedText}>{linkedItem.title || 'Linked item'}</Text>
              </View>
            </View>
          )}

          {/* AI tag hints */}
          {(aiTags.length > 0 || confirmedTags.length > 0) && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>ai tag hints</Text>
              <View style={s.tagsRow}>
                {[...new Set([...confirmedTags, ...aiTags])].map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[s.hintChip, confirmedTags.includes(tag) && s.hintChipActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[s.hintChipText, confirmedTags.includes(tag) && s.hintChipTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Clickable empty space to focus last block */}
          <TouchableOpacity 
            style={{ height: 400 }} 
            activeOpacity={1} 
            onPress={() => {
              const lastIdx = blocks.length - 1;
              if (inputRefs.current[lastIdx]) {
                inputRefs.current[lastIdx].focus();
              }
            }} 
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(13,12,11,0.96)',
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderSubtle,
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
  saveText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    color: C.textPrimary,
  },
  toolbar: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderSubtle,
    flexShrink: 0,
  },
  toolbarContent: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    gap: 4,
  },
  tb: {
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tbText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: C.textDim,
  },
  editorScroll: {
    flex: 1,
  },
  editorContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 80,
  },
  editorContentGrow: {
    flexGrow: 1,
  },
  editorCard: {
    backgroundColor: C.card,
    borderWidth: 0.5,
    borderColor: C.borderMedium,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  editorLabel: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    color: C.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  titleInput: {
    fontFamily: 'DMSansMedium',
    fontSize: 22,
    color: C.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 14,
    minHeight: 32,
    padding: 0,
  },
  emptyHint: {
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: C.borderMedium,
    borderRadius: 14,
    backgroundColor: C.elevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyHintLabel: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    color: C.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  emptyHintText: {
    fontFamily: 'DMSansRegular',
    fontSize: 14,
    color: C.textSec,
    lineHeight: 20,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    minHeight: 42,
    borderTopWidth: 0.5,
    borderTopColor: C.borderSubtle,
  },
  bulletDash: {
    color: C.textDark,
    flexShrink: 0,
    marginTop: 1,
    fontSize: 11,
    fontFamily: 'DMMonoRegular',
    marginRight: 10,
    lineHeight: 21,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: C.textDark,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 3,
  },
  checkboxDone: {
    backgroundColor: C.textPrimary,
    borderColor: C.textPrimary,
  },
  blockInput: {
    flex: 1,
    lineHeight: 21,
    minHeight: 24,
    padding: 0,
  },
  section: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: C.borderSubtle,
  },
  sectionLabel: {
    fontFamily: 'DMMonoRegular',
    fontSize: 8,
    color: C.textGhost,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  attachedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: C.elevated,
    borderWidth: 0.5,
    borderColor: C.borderMedium,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  attachedText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: '#6A6764',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  hintChip: {
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  hintChipActive: {
    borderStyle: 'solid',
    borderColor: C.borderStrong,
    backgroundColor: C.elevated,
  },
  hintChipText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 8,
    color: C.textDark,
  },
  hintChipTextActive: {
    color: C.textDim,
  },
});
