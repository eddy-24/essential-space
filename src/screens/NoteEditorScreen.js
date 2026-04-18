import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { itemsApi } from '../services/api/itemsApi';
import { colors } from '../design/colors';
import { spacing, radius } from '../design/spacing';

// Simple block-based rich text editor MVP
const getBlockStyle = (type) => {
  switch (type) {
    case 'heading1': return { fontSize: 24, fontWeight: 'bold', marginVertical: 8 };
    case 'heading2': return { fontSize: 20, fontWeight: 'bold', marginVertical: 6 };
    case 'bullet_list': return { fontSize: 16, marginVertical: 4 };
    case 'checkbox': return { fontSize: 16, marginVertical: 4 };
    case 'paragraph':
    default: return { fontSize: 16, marginVertical: 4, lineHeight: 24 };
  }
};

const NoteEditorScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { noteId, linkedItemId: initialLinkedItemId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Note State
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([{ type: 'paragraph', text: '' }]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [linkedItemId, setLinkedItemId] = useState(initialLinkedItemId || null);
  
  // Tags State
  const [aiTags, setAiTags] = useState([]);
  const [confirmedTags, setConfirmedTags] = useState([]);

  // Fetch existing note if editing
  useEffect(() => {
    if (noteId) {
      const fetchNote = async () => {
        setLoading(true);
        try {
          const item = await itemsApi.getItem(noteId);
          setTitle(item.title || '');
          if (item.richContent?.blocks?.length > 0) {
            setBlocks(item.richContent.blocks);
          } else if (item.content) {
            setBlocks([{ type: 'paragraph', text: item.content }]);
          }
          setAiTags(item.aiTags || []);
          setConfirmedTags(item.tags || []);
          if (item.linkedItemId) setLinkedItemId(item.linkedItemId);
        } catch (error) {
          console.error('Failed to load note', error);
        } finally {
          setLoading(false);
        }
      };
      fetchNote();
    }
  }, [noteId]);

  const updateBlockText = (text, index) => {
    const newBlocks = [...blocks];
    newBlocks[index].text = text;
    setBlocks(newBlocks);
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Enter') {
      const newBlocks = [...blocks];
      // Insert new paragraph block below
      newBlocks.splice(index + 1, 0, { type: 'paragraph', text: '' });
      setBlocks(newBlocks);
      setFocusedIndex(index + 1);
    } else if (nativeEvent.key === 'Backspace' && blocks[index].text === '' && index > 0) {
      // Remove block if empty and backspace pressed
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1);
      setBlocks(newBlocks);
      setFocusedIndex(index - 1);
    }
  };

  const changeFocusedBlockType = (type) => {
    const newBlocks = [...blocks];
    newBlocks[focusedIndex].type = type;
    setBlocks(newBlocks);
  };

  const insertMarkdown = (syntax) => {
    const newBlocks = [...blocks];
    newBlocks[focusedIndex].text += syntax;
    setBlocks(newBlocks);
  };

  const confirmAiTag = (tag) => {
    setAiTags(aiTags.filter(t => t !== tag));
    if (!confirmedTags.includes(tag)) {
      setConfirmedTags([...confirmedTags, tag]);
    }
  };

  const removeConfirmedTag = (tag) => {
    setConfirmedTags(confirmedTags.filter(t => t !== tag));
  };

  const toggleCheckbox = (index) => {
    const newBlocks = [...blocks];
    if (newBlocks[index].type === 'checkbox') {
      newBlocks[index].checked = !newBlocks[index].checked;
      setBlocks(newBlocks);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      const plainContent = blocks.map(b => b.text).join('\n');
      const payload = {
        type: 'NOTE',
        title,
        content: plainContent,
        richContent: {
          version: 1,
          blocks
        },
        linkedItemId,
        tags: confirmedTags
      };

      if (noteId) {
        await itemsApi.updateItem(noteId, payload);
      } else {
        await itemsApi.createItem(payload);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save note', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{noteId ? 'Edit Note' : 'New Note'}</Text>
        <TouchableOpacity onPress={saveNote} style={styles.headerButton} disabled={saving}>
          {saving ? (
             <ActivityIndicator size="small" color={colors.accent.primary} />
          ) : (
             <Text style={[styles.headerButtonText, { color: colors.accent.primary, fontWeight: '600' }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.editorArea}>
          {/* Metadata Section */}
          <View style={styles.metadataSection}>
            <TextInput
              style={styles.titleInput}
              placeholder="Note Title"
              placeholderTextColor={colors.text.muted}
              value={title}
              onChangeText={setTitle}
            />
            
            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => setLinkedItemId('mock-item-id-for-now')}
            >
              <Text style={styles.linkButtonText}>
                {linkedItemId ? '🔗 Attached to Item' : '🔗 Attach to an Item...'}
              </Text>
            </TouchableOpacity>

            {/* Tags Section */}
            <View style={styles.tagsSection}>
              {confirmedTags.map((tag, idx) => (
                <TouchableOpacity key={`conf-${idx}`} style={styles.confirmedTagChip} onPress={() => removeConfirmedTag(tag)}>
                  <Text style={styles.confirmedTagText}>{tag} ✕</Text>
                </TouchableOpacity>
              ))}
              {aiTags.map((tag, idx) => (
                <TouchableOpacity key={`ai-${idx}`} style={styles.aiTagChip} onPress={() => confirmAiTag(tag)}>
                  <Text style={styles.aiTagText}>{tag} +</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Blocks Editor */}
          <View style={styles.blocksContainer}>
            {blocks.map((block, index) => (
              <View key={index} style={styles.blockRow}>
                {block.type === 'bullet_list' && <Text style={styles.bulletPoint}>•</Text>}
                {block.type === 'checkbox' && (
                  <TouchableOpacity onPress={() => toggleCheckbox(index)} style={styles.checkboxOuter}>
                    {block.checked && <View style={styles.checkboxInner} />}
                  </TouchableOpacity>
                )}
                
                <TextInput
                  style={[styles.blockInput, getBlockStyle(block.type)]}
                  placeholder={index === 0 && !block.text ? "Start typing..." : ""}
                  placeholderTextColor={colors.text.muted}
                  value={block.text}
                  onChangeText={(text) => updateBlockText(text, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  multiline={block.type === 'paragraph'}
                  autoFocus={index === blocks.length - 1 && !noteId}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolBtn} onPress={() => changeFocusedBlockType('heading1')}>
            <Text style={styles.toolText}>H1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => changeFocusedBlockType('heading2')}>
            <Text style={styles.toolText}>H2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('**bold**')}>
            <Text style={[styles.toolText, { fontWeight: 'bold' }]}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('_italic_')}>
            <Text style={[styles.toolText, { fontStyle: 'italic' }]}>I</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => changeFocusedBlockType('bullet_list')}>
            <Text style={styles.toolText}>• List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => changeFocusedBlockType('checkbox')}>
            <Text style={styles.toolText}>☑ Check</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  editorArea: {
    flex: 1,
    padding: spacing.md,
  },
  metadataSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  titleInput: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  linkButtonText: {
    color: colors.accent.primary,
    fontSize: 14,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  confirmedTagChip: {
    backgroundColor: colors.accent.primary + '33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  confirmedTagText: {
    color: colors.accent.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  aiTagChip: {
    backgroundColor: colors.bg.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  aiTagText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  blocksContainer: {
    paddingBottom: spacing.xxl,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    color: colors.text.primary,
    fontSize: 20,
    marginRight: 8,
    marginTop: 4,
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  blockInput: {
    flex: 1,
    color: colors.text.primary,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolBtn: {
    padding: spacing.xs,
  },
  toolText: {
    color: colors.text.primary,
    fontSize: 14,
  },
});

export default NoteEditorScreen;
