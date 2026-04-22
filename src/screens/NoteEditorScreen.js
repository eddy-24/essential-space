import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { API_HOST } from '../services/api/client';
import Svg, { Path, Rect, Polyline, Circle, Line } from 'react-native-svg';

const IconH1 = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12h8M4 6v12M12 6v12M17 12h4M19 6v12" />
  </Svg>
);

const IconH2 = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12h8M4 6v12M12 6v12M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
  </Svg>
);

const IconList = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="8" y1="6" x2="21" y2="6" /><Line x1="8" y1="12" x2="21" y2="12" /><Line x1="8" y1="18" x2="21" y2="18" />
    <Line x1="3" y1="6" x2="3.01" y2="6" /><Line x1="3" y1="12" x2="3.01" y2="12" /><Line x1="3" y1="18" x2="3.01" y2="18" />
  </Svg>
);

const IconCheck = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 11 12 14 22 4" /><Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Svg>
);

const IconBold = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><Path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </Svg>
);

const IconItalic = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="19" y1="4" x2="10" y2="4" /><Line x1="14" y1="20" x2="5" y2="20" /><Line x1="15" y1="4" x2="9" y2="20" />
  </Svg>
);

const IconImage = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <Circle cx="8.5" cy="8.5" r="1.5" /><Polyline points="21 15 16 10 5 21" />
  </Svg>
);

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
  const { noteId, linkedItemId: initialLinkedItemId } = route.params || {};

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([{ type: 'paragraph', text: '' }]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [linkedItemId, setLinkedItemId] = useState(initialLinkedItemId || null);
  const [attachedImage, setAttachedImage] = useState(null);
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
    nav.navigate('NotesList');
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

  const handleAddScreenshot = async () => {
    const ImagePicker = require('react-native-image-picker');
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (!result.didCancel && result.assets?.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || 'screenshot.jpg',
        type: asset.type || 'image/jpeg',
      };
      try {
        const item = await itemsApi.uploadItem(file, 'SCREENSHOT', '');
        setLinkedItemId(item.id);
        setAttachedImage(item.previewImage || item.content);
      } catch (e) {
        console.error('Upload failed', e);
      }
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
        <ScrollView style={styles.editorContent} contentContainerStyle={{ paddingBottom: 120 }}>
          {attachedImage && (
            <View style={styles.attachedImageContainer}>
              <Image 
                source={{ uri: attachedImage.startsWith('/') ? `${API_HOST}${attachedImage}` : attachedImage }} 
                style={styles.attachedImagePreview} 
                resizeMode="cover" 
              />
            </View>
          )}
          <View style={styles.editor}>
            <TextInput style={styles.titleInput} placeholder="Note title" placeholderTextColor="#444" value={title} onChangeText={setTitle} />
          
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
          </View>
        </ScrollView>
        <View style={styles.floatingToolbarContainer}>
          <View style={styles.floatingToolbar}>
            <TouchableOpacity style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].type = 'h1'; setBlocks(nb); }}>
              <IconH1 color="#aaa" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].type = 'h2'; setBlocks(nb); }}>
              <IconH2 color="#aaa" />
            </TouchableOpacity>
            <View style={styles.toolbarDivider} />
            <TouchableOpacity style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].type = 'bullet'; setBlocks(nb); }}>
              <IconList color="#aaa" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].type = 'checkbox'; setBlocks(nb); }}>
              <IconCheck color="#aaa" />
            </TouchableOpacity>
            <View style={styles.toolbarDivider} />
            <TouchableOpacity style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].text += '**bold**'; setBlocks(nb); }}>
              <IconBold color="#aaa" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={() => { const nb = [...blocks]; nb[focusedIndex].text += '_italic_'; setBlocks(nb); }}>
              <IconItalic color="#aaa" />
            </TouchableOpacity>
            <View style={styles.toolbarDivider} />
            <TouchableOpacity style={styles.toolBtn} onPress={handleAddScreenshot}>
              <IconImage color="#f0f0f0" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  headerTitle: { fontFamily: 'DM Mono', fontSize: 11, color: '#f0f0f0' },
  headerBtn: { fontFamily: 'DM Mono', fontSize: 10, color: '#666' },
  editorContent: { flex: 1 },
  editor: { paddingHorizontal: 20, paddingTop: 16 },
  attachedImageContainer: { width: '100%', alignItems: 'center', marginBottom: -10 },
  attachedImagePreview: { width: '100%', height: 180 },
  titleInput: { fontFamily: 'DM Sans', fontSize: 32, fontWeight: 'bold', color: '#f0f0f0', marginBottom: 20 },
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
  floatingToolbarContainer: { position: 'absolute', bottom: 16, width: '100%', alignItems: 'center' },
  floatingToolbar: { flexDirection: 'row', backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 24, borderWidth: 0.5, borderColor: '#2e2e2e', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, alignItems: 'center' },
  toolBtn: { padding: 10, marginHorizontal: 2 },
  toolbarDivider: { width: 1, height: 20, backgroundColor: '#333', marginHorizontal: 6 }
});
