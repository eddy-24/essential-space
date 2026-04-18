import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useStore } from '../store/useStore';
import { colors } from '../design/colors';
import { layout, spacing, radius } from '../design/spacing';
import { textStyles } from '../design/typography';

export default function CollectionsScreen({ navigation }) {
  const { collections, fetchCollections } = useStore();

  useEffect(() => {
    fetchCollections();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigation.navigate('Collection', { collection: item })}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{item.icon || '📁'}</Text>
      <View style={styles.info}>
        <Text style={[textStyles.body, styles.name]}>{item.name}</Text>
        <Text style={[textStyles.mono_sm, styles.count]}>{item.itemCount || 0} items</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={textStyles.heading}>collections</Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: layout.cardGap,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  count: {
    color: colors.text.secondary,
  },
});
