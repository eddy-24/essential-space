import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { collectionsApi } from '../services/api/collectionsApi';
import { TextCard } from '../components/cards/TextCard';
import { LinkCard } from '../components/cards/LinkCard';
import { ImageCard } from '../components/cards/ImageCard';
import { FileCard } from '../components/cards/FileCard';
import { colors } from '../design/colors';
import { layout, spacing, radius } from '../design/spacing';
import { textStyles } from '../design/typography';

export default function CollectionScreen({ route, navigation }) {
  const { collection } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [collection.id]);

  const loadItems = async () => {
    try {
      const data = await collectionsApi.getCollectionItems(collection.id);
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    let CardComponent = TextCard;
    if (item.type === 'LINK') CardComponent = LinkCard;
    else if (item.type === 'IMAGE') CardComponent = ImageCard;
    else if (item.type === 'FILE') CardComponent = FileCard;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ItemDetail', { item })}
        activeOpacity={0.8}
      >
        <CardComponent item={item} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ fontSize: 24, color: colors.text.primary }}>←</Text>
        </TouchableOpacity>
        <Text style={[textStyles.heading, styles.headerTitle]}>
          {collection.icon} {collection.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text.primary,
  },
  listContent: {
    padding: layout.screenPadding,
  },
});
