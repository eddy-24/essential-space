import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';

const getBlockStyle = (type) => {
  switch (type) {
    case 'h1': return { fontSize: 20, fontWeight: 'bold', color: '#e0e0e0', marginVertical: 8 };
    case 'h2': return { fontSize: 16, fontWeight: 'bold', color: '#e0e0e0', marginVertical: 6 };
    case 'bullet': return { fontSize: 14, color: '#f0f0f0', marginVertical: 4 };
    case 'checkbox': return { fontSize: 14, color: '#f0f0f0', marginVertical: 4 };
    case 'paragraph':
    default: return { fontSize: 14, color: '#f0f0f0', marginVertical: 4 };
  }
};

export default function NoteEditorScreen() {
  const route = useRoute();
  const nav = useNavigation();
  const { noteId } = route.params || {};

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([{ type: 'paragraph', text: '' }]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [linkedItemId, setLinkedItemId] = useState(null);
  const [aiTags, setAiTags] = useState([]);
  const [confirmedTags, setConfirmedTags] = useState([]);

  useEffect(() => {
    if (noteId) {
      itemsApi.getItem(noteId).then(item => {
        setTitle(item.title || '');
        if (item.richContent?.blocks?.length) setBlocks(item.richContent.blocks);
        else if (item.content) setBlocks([{ type: 'paragraph', text: item.content }]);
        setAiTags(item.aiTags || []);
        setConfirmedTags(item.tags || []);
        setLinkedItemId(item.linkedItemId);
      }).catch(()=>{});
    }
  }, [noteId]);

  const saveNote = async () => {
    const payload = {
      type: 'NOTE',
      title,
      content: blocks.map(b => b.text).join('\n'),
      richContent: { version: 1, blocks },
      linkedItemId,
      tags: confirmedTags
    };
    if (noteId) await itemsApi.updateItem(noteId, payload);
    else await itemsApi.createItem(payload);
    nav.goBack();
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Enter') {
      const newB = [...blocks];
      newB.splice(idx + 1, 0, { type: 'paragraph', text: '' });
      setBlocks(newB);
      setFocusedIndex(idx + 1);
    } else if (e.nativeEvent.key === 'Backspace' && blocks[idx].text === '' && idx > 0) {
      const newB = [...blocks];
      newB.splice(idx, 1);
      setBlocks(newB);
      setFocusedIndex(idx - 1);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={styles.headerBtn}>cancel</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{noteId ? 'edit note' : 'new note'}</Text>
        <TouchableOpacity onPress={saveNote}><Text style={[styles.headerBtn, {color: '#f0f0f0'}]}>save</Text></TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.editor}>
          <TextInput style={styles.titleInput} placeholder="Title" placeholderTextColor="#444" value={title} onChangeText={setTitle} />
          
          <TouchableOpacity style={styles.attachPicker} onPress={() => setLinkedItemId('fake-uuid')}>
             <View style={[styles.attachDot, { backgroundColor: linkedItemId ? '#c080e0' : '#444' }]} />
             <Text style={styles.attachText}>{linkedItemId ? 'Attached Item' : 'Attach to...'}</Text>
          </TouchableOpacity>

          <View style={styles.tagsArea}>
            {confirmedTags.map(t => (
              <TouchableOpacity key={`c-${t}`} onPress={() => setConfirmedTags(confirmedTags.filter(x => x!==t))} style={styles.confirmedChip}>
                <Text style={styles.confirmedChipText}>{t}</Text>
              </TouchableOpacity>
            ))}
            {aiTags.filter(t => !confirmedTags.includes(t)).map(t => (
              <TouchableOpacity key={`ai-${t}`} onPress={() => setConfirmedTags([...confirmedTags, t])} style={styles.aiChip}>
                <Text style={styles.aiChipText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.blocks}>
            {blocks.map((b, i) => (
              <View key={i} style={styles.blockRow}>
                {b.type === 'bullet' && <Text style={styles.bullet}>•</Text>}
                {b.type === 'checkbox' && (
                  <TouchableOpacity style={styles.checkOuter} onPress={() => {
                    const nb = [...blocks]; nb[i].checked = !nb[i].checked; setBlocks(nb);
                  }}>
                    {b.checked && <View style={styles.checkInner} />}
                  </TouchableOpacity>
                )}
                <TextInput
                  style={[styles.blockInput, getBlockStyle(b.type)]}
                  placeholder={i === 0 ? "Write something..." : ""}
                  placeholderTextColor="#444"
                  value={b.text}
                  onChangeText={txt => { const nb = [...blocks]; nb[i].text = txt; setBlocks(nb); }}
                  onFocus={() => setFocusedIndex(i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  multiline={b.type === 'paragraph'}
                  autoFocus={i === blocks.length - 1 && !noteId}
                />
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.toolbar}>
          {['h1', 'h2', 'bullet', 'checkbox'].map(t => (
            <TouchableOpacity key={t} style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].type = t; setBlocks(nb); }}>
              <Text style={styles.toolBtnText}>{t}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].text += '**bold**'; setBlocks(nb); }}>
              <Text style={styles.toolBtnText}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].text += '_italic_'; setBlocks(nb); }}>
              <Text style={styles.toolBtnText}>I</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  headerTitle: { fontFamily: 'DM Mono', fontSize: 11, color: '#888' },
  headerBtn: { fontFamily: 'DM Mono', fontSize: 11, color: '#666' },
  editor: { padding: 16 },
  titleInput: { fontFamily: 'DM Sans', fontSize: 24, fontWeight: 'bold', color: '#f0f0f0', marginBottom: 12 },
  attachPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', padding: 8, borderRadius: 4, marginBottom: 12 },
  attachDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  attachText: { fontFamily: 'DM Mono', fontSize: 10, color: '#888' },
  tagsArea: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  confirmedChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#222', borderWidth: 1, borderColor: '#888' },
  confirmedChipText: { fontFamily: 'DM Mono', fontSize: 8, color: '#e0e0e0' },
  aiChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: '#333', borderStyle: 'dashed' },
  aiChipText: { fontFamily: 'DM Mono', fontSize: 8, color: '#444' },
  blocks: { paddingBottom: 100 },
  blockRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bullet: { color: '#888', fontSize: 14, marginRight: 8, marginTop: 4 },
  checkOuter: { width: 14, height: 14, borderWidth: 1, borderColor: '#666', borderRadius: 2, marginRight: 8, marginTop: 8, justifyContent: 'center', alignItems: 'center' },
  checkInner: { width: 8, height: 8, backgroundColor: '#f0f0f0', borderRadius: 1 },
  blockInput: { flex: 1, fontFamily: 'DM Sans' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-around', padding: 8, backgroundColor: '#0d0d0d', borderTopWidth: 1, borderTopColor: '#1e1e1e' },
  toolBtn: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0.5, borderColor: '#222', borderRadius: 3, backgroundColor: '#141414' },
  toolBtnText: { fontFamily: 'DM Mono', fontSize: 7, color: '#666' }
});
