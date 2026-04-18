import React, { useState, useImperativeHandle } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard, Modal, SafeAreaView } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { useStore } from '../store/useStore';
import { colors } from '../design/colors';
import { spacing, radius } from '../design/spacing';
import { textStyles } from '../design/typography';

export const CaptureSheet = React.forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [detectedType, setDetectedType] = useState('TEXT');
  const [selectedFile, setSelectedFile] = useState(null);
  const { createItem, uploadItem, isLoading } = useStore();

  useImperativeHandle(ref, () => ({
    expand: () => setVisible(true),
    close: () => {
      setVisible(false);
      resetState();
    }
  }));

  const resetState = () => {
    setText('');
    setDetectedType('TEXT');
    setSelectedFile(null);
  };

  const detectType = (input) => {
    const urlRegex = /^(https?:\/\/)/i;
    return urlRegex.test(input.trim()) ? 'LINK' : 'TEXT';
  };

  const handleTextChange = (val) => {
    setText(val);
    if (!selectedFile) {
      setDetectedType(detectType(val));
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (!result.didCancel && result.assets?.length > 0) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName || 'photo.jpg',
        type: asset.type || 'image/jpeg',
      });
      setDetectedType('IMAGE');
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (result && result.length > 0) {
        const file = result[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
        setDetectedType('FILE');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error(err);
      }
    }
  };

  const handleSave = async () => {
    if (!text.trim() && !selectedFile) return;

    try {
      if (selectedFile) {
        await uploadItem(selectedFile, detectedType, text.trim() || undefined);
      } else {
        await createItem({
          type: detectedType,
          content: text.trim(),
          note: null,
        });
      }

      setVisible(false);
      resetState();
    } catch (err) {
      console.error('Failed to save item', err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setVisible(false);
        resetState();
      }}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={() => {
            Keyboard.dismiss();
            setVisible(false);
            resetState();
          }} 
        />
        <SafeAreaView style={styles.sheetBackground}>
          <View style={styles.handleIndicator} />
          <View style={styles.container}>
            <TextInput
              style={styles.input}
              placeholder="Type anything... (auto-detects links)"
              placeholderTextColor={colors.text.muted}
              value={text}
              onChangeText={handleTextChange}
              multiline
            />

            {selectedFile && (
              <View style={styles.filePreview}>
                <Text style={textStyles.mono_sm}>Attached: {selectedFile.name}</Text>
              </View>
            )}

            <View style={styles.actionsRow}>
              <View style={styles.mediaActions}>
                <TouchableOpacity onPress={handlePickImage} style={styles.iconButton}>
                  <Text style={{ fontSize: 20 }}>📷</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickFile} style={styles.iconButton}>
                  <Text style={{ fontSize: 20 }}>📁</Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.typeIndicator,
                    { backgroundColor: colors.type[detectedType.toLowerCase()] || colors.text.primary },
                  ]}
                />
                <Text style={textStyles.mono_sm}>{detectedType}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (isLoading || (!text.trim() && !selectedFile)) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isLoading || (!text.trim() && !selectedFile)}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetBackground: {
    backgroundColor: colors.bg.secondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    minHeight: '50%',
    maxHeight: '90%',
  },
  handleIndicator: {
    backgroundColor: colors.border.strong,
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  input: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
    textAlignVertical: 'top',
    padding: 0,
  },
  filePreview: {
    padding: spacing.sm,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  mediaActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...textStyles.mono_md,
    color: colors.text.inverse,
  },
});
