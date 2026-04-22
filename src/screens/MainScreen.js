import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { C } from '../design/colors';
import { DotGrid } from '../components/DotGrid';
import { CaptureSheet } from '../components/CaptureSheet';
import { IcFeed, IcSearch, IcNote, IcFile, IcSignal, IcWifi, IcBattery } from '../components/Icons';
import { itemsApi } from '../services/api/itemsApi';
import FeedScreen from './FeedScreen';
import SearchScreen from './SearchScreen';
import NotesScreen from './NotesScreen';
import FilesScreen from './FilesScreen';

const TABS = [
  { key: 'feed',   Icon: IcFeed },
  { key: 'search', Icon: IcSearch },
  { key: 'notes',  Icon: IcNote },
  { key: 'files',  Icon: IcFile },
];

const PillTab = ({ tabKey, activeTab, Icon, onPress }) => {
  const active = tabKey === activeTab;
  return (
    <TouchableOpacity style={s.pillTab} onPress={() => onPress(tabKey)} activeOpacity={0.7}>
      <View style={s.pillTabIcon}>
        <Icon c={active ? C.textPrimary : C.textDarker} size={20} />
      </View>
      <View style={[s.pillDot, { opacity: active ? 1 : 0 }]} />
    </TouchableOpacity>
  );
};

const FABCross = ({ open }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(rotate, {
      toValue: open ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [open]);
  const rotation = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  return (
    <Animated.View style={[s.fabCross, { transform: [{ rotate: rotation }] }]}>
      <View style={s.fabBar} />
      <View style={[s.fabBar, s.fabBarV]} />
    </Animated.View>
  );
};

export default function MainScreen({ navigation }) {
  const [tab, setTab] = useState('feed');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  // Incrementing this forces the active screen to re-fetch after a capture
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useCallback((screen, params) => {
    navigation.navigate(screen, params);
  }, [navigation]);

  const toggleFab = () => {
    const next = !fabOpen;
    setFabOpen(next);
    setSheetOpen(next);
  };

  const closeCapture = () => {
    setFabOpen(false);
    setSheetOpen(false);
  };

  const afterCapture = (targetTab) => {
    setTab(targetTab);
    setRefreshKey(k => k + 1);
  };

  const handleLink = useCallback(() => {
    Alert.prompt(
      'add link',
      'paste a URL',
      async (url) => {
        if (!url?.trim()) return;
        try {
          await itemsApi.createItem({ type: 'LINK', content: url.trim() });
          afterCapture('feed');
        } catch {
          Alert.alert('Error', 'Could not save link. Check your connection.');
        }
      },
      'plain-text',
      '',
      'url',
    );
  }, []);

  const handleFile = useCallback(async () => {
    try {
      const [result] = await DocumentPicker.pick({ allowMultiSelection: false });
      const file = { uri: result.uri, type: result.type || 'application/octet-stream', name: result.name || 'file' };
      await itemsApi.uploadItem(file, 'FILE', null);
      afterCapture('files');
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        Alert.alert('Error', 'Could not upload file. Check your connection.');
      }
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.9 }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset) return;
      const file = { uri: asset.uri, type: asset.type || 'image/jpeg', name: asset.fileName || 'screenshot.jpg' };
      try {
        await itemsApi.uploadItem(file, 'SCREENSHOT', null);
        afterCapture('feed');
      } catch {
        Alert.alert('Error', 'Could not upload image. Check your connection.');
      }
    });
  }, []);

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <DotGrid />

      {/* Status bar */}
      <SafeAreaView style={s.statusWrap}>
        <View style={s.statusBar}>
          <Text style={s.statusTime}>9:41</Text>
          <View style={s.statusIcons}>
            <IcSignal />
            <IcWifi />
            <IcBattery />
          </View>
        </View>
      </SafeAreaView>

      {/* Tab content */}
      <View style={s.content}>
        {tab === 'feed'   && <FeedScreen   key={`feed-${refreshKey}`}   navigate={navigate} />}
        {tab === 'search' && <SearchScreen key={`search-${refreshKey}`} navigate={navigate} />}
        {tab === 'notes'  && <NotesScreen  key={`notes-${refreshKey}`}  navigate={navigate} />}
        {tab === 'files'  && <FilesScreen  key={`files-${refreshKey}`}  navigate={navigate} />}
      </View>

      {/* Bottom bar: pill nav + FAB */}
      <View style={s.bottomBar}>
        <View style={s.pillNav}>
          {TABS.map(({ key, Icon }) => (
            <PillTab key={key} tabKey={key} activeTab={tab} Icon={Icon} onPress={setTab} />
          ))}
        </View>
        <TouchableOpacity
          style={[s.fab, fabOpen && s.fabOpen]}
          onPress={toggleFab}
          activeOpacity={0.85}
        >
          <FABCross open={fabOpen} />
        </TouchableOpacity>
      </View>

      {/* Capture sheet */}
      <CaptureSheet
        visible={sheetOpen}
        onClose={closeCapture}
        onNote={() => navigate('NoteEditor')}
        onLink={handleLink}
        onScreenshot={handleScreenshot}
        onFile={handleFile}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  statusWrap: {
    zIndex: 50,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingVertical: 8,
  },
  statusTime: {
    fontFamily: 'DMSansMedium',
    fontSize: 15,
    color: C.textPrimary,
    letterSpacing: -0.4,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 60,
    pointerEvents: 'box-none',
  },
  pillNav: {
    backgroundColor: C.pillNav,
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    borderWidth: 0.5,
    borderColor: C.borderStrong,
  },
  pillTab: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  pillTabIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.textPrimary,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabOpen: {},
  fabCross: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBar: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: C.bg,
    borderRadius: 2,
  },
  fabBarV: {
    transform: [{ rotate: '90deg' }],
  },
});
