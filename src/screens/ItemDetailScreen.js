import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useStore } from '../store/useStore';
import { colors } from '../design/colors';
import { layout, spacing, radius } from '../design/spacing';
import { textStyles } from '../design/typography';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { updateItem, deleteItem } = useStore();
  const [note, setNote] = useState(item.note || '');
  const [content, setContent] = useState(item.content || '');

  const handleSave = async () => {
    try {
      await updateItem(item.id, { note, content });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item.id);
          navigation.navigate('Inbox');
        },
      },
    ]);
  };

  const handleMore = () => {
    Alert.alert('Options', null, [
      { text: item.isPinned ? 'Unpin' : 'Pin', onPress: () => updateItem(item.id, { isPinned: !item.isPinned }) },
      { text: 'Add to Collection', onPress: () => {} },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={{ fontSize: 24, color: colors.text.primary }}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMore} style={styles.iconButton}>
          <Text style={{ fontSize: 24, color: colors.text.primary }}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.metaRow}>
          <Text style={textStyles.mono_sm}>
            {item.type} · {formatDate(item.createdAt)}
          </Text>
          {item.isPinned && <Text style={{ fontSize: 16 }}>📌</Text>}
        </View>

        <TextInput
          style={[textStyles.body, styles.contentInput]}
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="Content..."
          placeholderTextColor={colors.text.muted}
        />

        <View style={styles.noteSection}>
          <Text style={[textStyles.mono_sm, styles.sectionTitle]}>Note:</Text>
          <TextInput
            style={[textStyles.body, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Add a note..."
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.collectionsSection}>
          <Text style={[textStyles.mono_sm, styles.sectionTitle]}>Collections:</Text>
          <View style={styles.tagsContainer}>
            {item.collections?.map((c) => (
              <View key={c.id} style={styles.tag}>
                <Text style={textStyles.mono_sm}>
                  {c.icon} {c.name}
                </Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addTagButton}>
              <Text style={textStyles.mono_sm}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(note !== (item.note || '') || content !== (item.content || '')) && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  iconButton: {
    padding: spacing.xs,
  },
  contentContainer: {
    padding: layout.screenPadding,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  contentInput: {
    color: colors.text.primary,
    fontSize: 18,
    marginBottom: spacing.xl,
    padding: 0,
  },
  noteSection: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  sectionTitle: {
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  noteInput: {
    color: colors.text.primary,
    minHeight: 60,
    padding: 0,
  },
  collectionsSection: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.bg.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  addTagButton: {
    backgroundColor: colors.bg.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.accent.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonText: {
    ...textStyles.mono_md,
    color: colors.text.inverse,
  },
});
