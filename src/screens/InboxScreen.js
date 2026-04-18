import React, { useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useStore } from '../store/useStore';
import { TextCard } from '../components/cards/TextCard';
import { LinkCard } from '../components/cards/LinkCard';
import { ImageCard } from '../components/cards/ImageCard';
import { FileCard } from '../components/cards/FileCard';
import { CaptureSheet } from '../components/CaptureSheet';
import { colors } from '../design/colors';
import { layout, spacing, radius } from '../design/spacing';
import { textStyles } from '../design/typography';

export default function InboxScreen({ navigation }) {
  const { items, fetchItems, deleteItem } = useStore();
  const captureSheetRef = useRef(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  const renderItem = ({ item }) => {
    let CardComponent = TextCard;
    if (item.type === 'LINK') CardComponent = LinkCard;
    else if (item.type === 'IMAGE') CardComponent = ImageCard;
    else if (item.type === 'FILE') CardComponent = FileCard;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ItemDetail', { item })}
        onLongPress={() => {
          Alert.alert('Options', null, [
            { text: 'Add to Collection' },
            { text: 'Pin' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
        activeOpacity={0.8}
      >
        <CardComponent item={item} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={textStyles.heading}>essential space</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={{ fontSize: 24 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => captureSheetRef.current?.expand()}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <CaptureSheet ref={captureSheetRef} />
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
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  listContent: {
    padding: layout.screenPadding,
    paddingBottom: layout.fabSize + layout.fabOffset * 2,
  },
  deleteAction: {
    backgroundColor: colors.accent.danger,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: layout.cardGap,
    borderRadius: radius.md,
  },
  deleteActionText: {
    color: colors.text.primary,
    ...textStyles.mono_md,
  },
  fab: {
    position: 'absolute',
    bottom: layout.fabOffset,
    right: layout.fabOffset,
    width: layout.fabSize,
    height: layout.fabSize,
    borderRadius: layout.fabSize / 2,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.text.inverse,
    fontWeight: '300',
    marginTop: -2,
  },
});
