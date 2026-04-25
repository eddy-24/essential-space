import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Share,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import RNFS from 'react-native-fs';
import { screenshotsApi } from '../services/api/screenshotsApi';
import { API_HOST } from '../services/api/client';

function DataRow({ label, value, large }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataKey}>{label.toUpperCase()}</Text>
      <Text style={[styles.dataValue, large && styles.dataValueLarge]} numberOfLines={3}>
        {value || '—'}
      </Text>
    </View>
  );
}

export default function ScreenshotDetailScreen() {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ocrExpanded, setOcrExpanded] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const fetchItem = useCallback(() => {
    screenshotsApi.getScreenshot(id)
      .then(data => { setItem(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useFocusEffect(fetchItem);

  const handleRetry = async () => {
    setLoading(true);
    try {
      await screenshotsApi.retryProcessing(id);
      fetchItem();
    } catch (e) { setLoading(false); }
  };

  const handleOpenOriginal = () => setImageModalVisible(true);

  const handleCopyText = () => {
    const text = item?.ocrText || item?.aiSummary || '';
    if (!text) { Alert.alert('NO TEXT', 'No extracted text available for this screenshot.'); return; }
    Clipboard.setString(text);
    Alert.alert('COPIED', 'Text copied to clipboard.');
  };

  const handleShare = async () => {
    if (!item) return;
    try {
      const ext = imageUri.split('.').pop()?.split('?')[0] || 'png';
      const localPath = `${RNFS.TemporaryDirectoryPath}share_${item.id}.${ext}`;
      await RNFS.downloadFile({ fromUrl: imageUri, toFile: localPath }).promise;
      await Share.share({ title: item.generatedTitle || 'Screenshot', message: item.aiSummary || '', url: `file://${localPath}` });
    } catch (e) {}
  };

  const handleDelete = () => {
    Alert.alert(
      'DELETE SCREENSHOT',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await screenshotsApi.deleteScreenshot(id);
              navigation.goBack();
            } catch (e) {}
          },
        },
      ]
    );
  };

  if (loading && !item) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color="#ffffff" />
          <Text style={styles.loaderText}>LOADING...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) return null;

  let details = {};
  try { details = JSON.parse(item.detectedDetails || '{}'); } catch (e) {}
  let tags = [];
  try { tags = JSON.parse(item.aiTags || '[]'); } catch (e) {}

  const imageUri = item.imageUrl?.startsWith('/') ? `${API_HOST}${item.imageUrl}` : item.imageUrl;
  const isProcessing = item.processingStatus === 'PROCESSING';
  const isFailed = item.processingStatus === 'FAILED';
  const isDone = item.processingStatus === 'COMPLETED';

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <View style={styles.arrowLeft} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>ITEM DETAILS</Text>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => navigation.navigate('EditScreenshot', { id })}
        >
          <View style={styles.moreDotsWrap}>
            {[0,1,2].map(i => <View key={i} style={styles.moreDot} />)}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Category tag */}
        {isDone && item.aiCategory && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.aiCategory}</Text>
          </View>
        )}

        {/* Title */}
        {isDone && (
          <Text style={styles.headline}>
            {item.generatedTitle?.toUpperCase() || 'UNTITLED'}
          </Text>
        )}

        {/* Image with reticle corners */}
        <View style={styles.imageFrame}>
          <View style={styles.imageGradient} pointerEvents="none" />
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          {/* Reticle corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Processing banner */}
        {isProcessing && (
          <View style={styles.processingBanner}>
            <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 10 }} />
            <Text style={styles.processingText}>AI IS ANALYZING THIS SCREENSHOT...</Text>
          </View>
        )}

        {/* Failed banner */}
        {isFailed && (
          <View style={styles.failedBanner}>
            <Text style={styles.failedText}>PROCESSING FAILED</Text>
            {item.processingError && (
              <Text style={styles.failedError}>{item.processingError}</Text>
            )}
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryBtnText}>RETRY AI PROCESSING</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Data table */}
        {isDone && (
          <View style={styles.dataTable}>
            <View style={styles.dataTableHeader}>
              <Text style={styles.dataTableTitle}>ESSENTIAL INFORMATION</Text>
              <View style={styles.dataObjectIcon}>
                <View style={styles.dataObjectBrace} />
              </View>
            </View>

            <View style={styles.dataRows}>
              {item.aiSummary && (
                <DataRow label="Summary" value={item.aiSummary} />
              )}

              {Object.entries(details).map(([k, v]) => (
                <DataRow key={k} label={k} value={String(v)} />
              ))}

              {item.createdAt && (
                <DataRow label="Date Saved" value={new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} />
              )}

              {item.originalFilename && (
                <DataRow label="Source" value={item.originalFilename} />
              )}
            </View>
          </View>
        )}

        {/* Tags */}
        {isDone && tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionTitle}>TAGS</Text>
            <View style={styles.tagsRow}>
              {tags.map((t, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* OCR text */}
        {isDone && item.ocrText && (
          <View style={styles.ocrSection}>
            <TouchableOpacity
              style={styles.ocrHeader}
              onPress={() => setOcrExpanded(!ocrExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.ocrHeaderTitle}>EXTRACTED TEXT (OCR)</Text>
              <Text style={styles.ocrChevron}>{ocrExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {ocrExpanded && (
              <View style={styles.ocrContent}>
                <Text style={styles.ocrText}>{item.ocrText}</Text>
              </View>
            )}
          </View>
        )}

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>DELETE SCREENSHOT</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed action bar */}
      {isDone && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleOpenOriginal}>
            <View style={styles.openIcon} />
            <Text style={styles.primaryActionText}>OPEN ORIGINAL SCREENSHOT</Text>
          </TouchableOpacity>
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryAction} onPress={handleCopyText}>
              <Text style={styles.secondaryActionText}>COPY TEXT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction} onPress={handleShare}>
              <Text style={styles.secondaryActionText}>SHARE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full-screen image modal */}
      <Modal
        visible={imageModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setImageModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕  CLOSE</Text>
            </TouchableOpacity>
          </View>
          <Image source={{ uri: imageUri }} style={styles.modalImage} resizeMode="contain" />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#131313' },

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 3,
    color: '#8e9192',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(19,19,19,0.95)',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
  },
  headerTitle: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 4,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreDotsWrap: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
  },
  moreDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },

  // Scroll
  scroll: { paddingBottom: 20 },

  // Category
  categoryTag: {
    marginTop: 20,
    marginHorizontal: 20,
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryTagText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 2,
    color: '#131313',
    textTransform: 'uppercase',
  },

  // Headline
  headline: {
    fontFamily: 'DMMonoMedium',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#ffffff',
    lineHeight: 36,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },

  // Image frame
  imageFrame: {
    marginHorizontal: 20,
    aspectRatio: 4 / 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#1f1f1f',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 1,
    // gradient simulation via opacity
    backgroundColor: 'rgba(19,19,19,0)',
  },
  // Reticle corners
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    zIndex: 2,
    margin: 8,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#ffffff' },
  cornerTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#ffffff' },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#ffffff' },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#ffffff' },

  // Banners
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  processingText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#8e9192',
  },
  failedBanner: {
    margin: 20,
    padding: 16,
    backgroundColor: '#1a0000',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    gap: 8,
  },
  failedText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 2,
    color: '#ff6b6b',
  },
  failedError: {
    fontFamily: 'DMMonoRegular',
    fontSize: 12,
    color: '#ff6b6b',
    opacity: 0.7,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    alignSelf: 'flex-start',
  },
  retryBtnText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#ff6b6b',
  },

  // Data table
  dataTable: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  dataTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    marginBottom: 0,
  },
  dataTableTitle: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
  },
  dataObjectIcon: { width: 16, height: 16 },
  dataObjectBrace: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  dataRows: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  dataKey: {
    fontFamily: 'DMMonoMedium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.4)',
    width: 90,
    flexShrink: 0,
    paddingTop: 2,
  },
  dataValue: {
    fontFamily: 'DMSansRegular',
    fontSize: 15,
    color: '#ffffff',
    flex: 1,
    textAlign: 'right',
  },
  dataValueLarge: {
    fontFamily: 'DMMonoMedium',
    fontSize: 24,
    letterSpacing: 1,
  },

  // Tags
  tagsSection: {
    marginTop: 24,
    marginHorizontal: 20,
    gap: 12,
  },
  tagsSectionTitle: {
    fontFamily: 'DMMonoMedium',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  tagText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    color: '#8e9192',
    letterSpacing: 0.5,
  },

  // OCR
  ocrSection: {
    marginTop: 24,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  ocrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  ocrHeaderTitle: {
    fontFamily: 'DMMonoMedium',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
  },
  ocrChevron: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  ocrContent: {
    backgroundColor: '#0e0e0e',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  ocrText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    color: '#8e9192',
    lineHeight: 18,
  },

  // Delete
  deleteBtn: {
    marginTop: 32,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 2,
    color: '#FF3B30',
  },

  // Full-screen image modal
  modalScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modalCloseText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 2,
    color: '#ffffff',
  },
  modalImage: {
    flex: 1,
    width: '100%',
  },

  // Fixed action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(19,19,19,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    paddingBottom: 28,
    gap: 8,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#ffffff',
    gap: 10,
  },
  openIcon: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#131313',
  },
  primaryActionText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#131313',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#ffffff',
  },
});
