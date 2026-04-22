import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import { itemsApi } from '../services/api/itemsApi';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';

const CameraIcon = ({ color }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <Circle cx="12" cy="13" r="4" />
  </Svg>
);

const NoteIcon = ({ color }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 20h9" />
    <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Svg>
);

const LinkIcon = ({ color }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
);

export const GlobalFab = ({ onUploadSuccess }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const nav = useNavigation();

  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleCreateNote = () => {
    setModalVisible(false);
    nav.navigate('notes', { screen: 'NoteEditor', params: { noteId: null } });
  };

  const handleUploadScreenshot = async () => {
    setModalVisible(false);
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
        await itemsApi.uploadItem(file, 'SCREENSHOT', '');
        if (onUploadSuccess) onUploadSuccess();
      } catch (e) {
        console.error('Upload failed', e);
      }
    }
  };

  const handleSubmitLink = async () => {
    if (!linkUrl.trim()) return;
    try {
      await itemsApi.createItem({ type: 'LINK', content: linkUrl.trim(), note: null });
      setLinkInputVisible(false);
      setLinkUrl('');
      if (onUploadSuccess) onUploadSuccess();
    } catch(e) {}
  };
  
  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible || linkInputVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => { setModalVisible(false); setLinkInputVisible(false); }}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                {linkInputVisible ? (
                  <View style={styles.linkContainer}>
                    <View style={styles.linkInputWrapper}>
                      <LinkIcon color="#888" />
                      <TextInput
                        style={styles.linkInput}
                        placeholder="Paste link here..."
                        placeholderTextColor="#666"
                        autoFocus
                        value={linkUrl}
                        onChangeText={setLinkUrl}
                        onSubmitEditing={handleSubmitLink}
                        keyboardAppearance="dark"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <TouchableOpacity style={styles.saveLinkBtn} onPress={handleSubmitLink}>
                      <Text style={styles.saveLinkText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.menu}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleUploadScreenshot}>
                      <View style={styles.iconBox}><CameraIcon color="#f0f0f0" /></View>
                      <Text style={styles.menuText}>Screenshot</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={handleCreateNote}>
                      <View style={styles.iconBox}><NoteIcon color="#f0f0f0" /></View>
                      <Text style={styles.menuText}>Write Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setModalVisible(false); setTimeout(() => setLinkInputVisible(true), 100); }}>
                      <View style={styles.iconBox}><LinkIcon color="#f0f0f0" /></View>
                      <Text style={styles.menuText}>Save Link</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  fabIcon: { fontSize: 28, color: '#0a0a0a', marginTop: -2, fontWeight: '300' },
  overlay: { flex: 1, backgroundColor: 'rgba(10,10,10,0.85)', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 24 },
  keyboardView: { width: '100%', alignItems: 'flex-end' },
  menu: { backgroundColor: '#141414', borderRadius: 16, width: 200, paddingVertical: 8, marginBottom: 70, borderWidth: 0.5, borderColor: '#2a2a2a', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  iconBox: { width: 32, alignItems: 'flex-start' },
  menuText: { fontFamily: 'DM Sans', fontSize: 15, color: '#f0f0f0', fontWeight: '500' },
  linkContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 24, paddingHorizontal: 8, paddingVertical: 8, width: '100%', marginBottom: 16, borderWidth: 0.5, borderColor: '#2a2a2a' },
  linkInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: 20, paddingHorizontal: 16, height: 44, marginRight: 8 },
  linkInput: { flex: 1, color: '#fff', fontFamily: 'DM Sans', fontSize: 15, marginLeft: 10, height: '100%' },
  saveLinkBtn: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 20, height: 44, justifyContent: 'center', alignItems: 'center' },
  saveLinkText: { fontFamily: 'DM Sans', fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
});
