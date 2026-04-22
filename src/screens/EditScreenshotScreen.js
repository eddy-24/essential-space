import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { screenshotsApi } from '../services/api/screenshotsApi';

const CATEGORIES = ['EVENT', 'WISHLIST', 'DATE', 'NOTE', 'LINK', 'OTHER'];

export default function EditScreenshotScreen() {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [details, setDetails] = useState('');

  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  useEffect(() => {
    screenshotsApi.getScreenshot(id)
      .then(data => {
        setItem(data);
        setTitle(data.generatedTitle || '');
        setSummary(data.aiSummary || '');
        setCategory(data.aiCategory || 'OTHER');
        try { setTags(JSON.parse(data.aiTags || '[]').join(', ')); } catch(e) {}
        try { setDetails(JSON.stringify(JSON.parse(data.detectedDetails || '{}'), null, 2)); } catch(e) {}
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    let parsedTags = [];
    try { parsedTags = tags.split(',').map(s => s.trim()).filter(s => s); } catch(e) {}
    
    let parsedDetails = {};
    try { parsedDetails = JSON.parse(details); } catch(e) { parsedDetails = {}; } // fallback if invalid json
    
    const updateDto = {
      generatedTitle: title,
      aiSummary: summary,
      aiCategory: category,
      aiTags: JSON.stringify(parsedTags),
      detectedDetails: JSON.stringify(parsedDetails)
    };

    try {
      await screenshotsApi.updateScreenshot(id, updateDto);
      navigation.goBack();
    } catch(e) {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator color="#f0f0f0" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.headerBtn}>cancel</Text></TouchableOpacity>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#f0f0f0" size="small" /> : <Text style={styles.headerBtnPrimary}>save</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map(c => (
              <TouchableOpacity 
                key={c} 
                style={[styles.catBtn, category === c && styles.catBtnActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#444"
          />

          <Text style={styles.label}>Summary</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={summary}
            onChangeText={setSummary}
            multiline
            placeholderTextColor="#444"
          />

          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="e.g. receipt, dinner, food"
            placeholderTextColor="#444"
          />

          <Text style={styles.label}>Detected Details (JSON format)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { fontFamily: 'DM Mono', fontSize: 12 }]}
            value={details}
            onChangeText={setDetails}
            multiline
            placeholder='{"date": "2026-04-25"}'
            placeholderTextColor="#444"
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerBtn: { fontFamily: 'DM Mono', fontSize: 14, color: '#888' },
  headerBtnPrimary: { fontFamily: 'DM Mono', fontSize: 14, color: '#f0f0f0', fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 60 },
  label: { fontFamily: 'DM Mono', fontSize: 12, color: '#666', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#141414', borderRadius: 8, padding: 12, color: '#f0f0f0', fontFamily: 'DM Sans', fontSize: 16, borderWidth: 1, borderColor: '#222' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#333', backgroundColor: '#111' },
  catBtnActive: { backgroundColor: '#f0f0f0', borderColor: '#f0f0f0' },
  catText: { fontFamily: 'DM Mono', fontSize: 11, color: '#aaa' },
  catTextActive: { color: '#0a0a0a', fontWeight: 'bold' },
});
