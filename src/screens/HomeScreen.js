import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { screenshotsApi } from '../services/api/screenshotsApi';

export default function HomeScreen() {
  const navigation = useNavigation();
  const scanLine = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleScan = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.9 });
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        await screenshotsApi.uploadScreenshot({
          uri: asset.uri,
          name: asset.fileName || 'screenshot.jpg',
          type: asset.type || 'image/jpeg',
        });
        navigation.navigate('Gallery');
      } catch (e) {
        console.error('Upload failed', e);
      }
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Main centered content */}
      <View style={styles.content}>

        {/* Status label */}
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusLabel}>SYS.READY</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>ESSENTIAL{'\n'}SPACE</Text>

        {/* Subtext */}
        <Text style={styles.subtext}>
          Focus on what matters.{'\n'}Auto-extract information{'\n'}from your screenshots.
        </Text>

        {/* Scan button */}
        <View style={styles.scanWrapper}>
          <Animated.View style={[styles.outerRing, { transform: [{ scale: pulse }] }]} />

          <TouchableOpacity style={styles.scanButton} onPress={handleScan} activeOpacity={0.85}>
            {/* Scanning laser line */}
            <Animated.View
              style={[
                styles.scanLaser,
                {
                  transform: [{
                    translateY: scanLine.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-90, 90],
                    }),
                  }],
                },
              ]}
              pointerEvents="none"
            />

            {/* Reticle icon */}
            <View style={styles.reticle}>
              <View style={[styles.reticleCorner, styles.reticleTL]} />
              <View style={[styles.reticleCorner, styles.reticleTR]} />
              <View style={[styles.reticleCorner, styles.reticleBL]} />
              <View style={[styles.reticleCorner, styles.reticleBR]} />
              <View style={styles.reticleCenter}>
                <View style={styles.reticleDot} />
              </View>
            </View>

            <Text style={styles.scanLabel}>SCAN</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom decorative anchors */}
      <View style={styles.anchors}>
        <View>
          <Text style={styles.anchorText}>LAT: 44.4268 N</Text>
          <Text style={styles.anchorText}>LNG: 26.1025 E</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.anchorText}>VER: 2.0.0</Text>
          <Text style={styles.anchorText}>NET: SECURE</Text>
        </View>
      </View>
    </View>
  );
}

const SCAN_SIZE = 190;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#131313',
    flexDirection: 'column',
  },

  // Main content — fills remaining space and centers children
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    backgroundColor: '#ffffff',
  },
  statusLabel: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 3,
    color: '#8e9192',
    textTransform: 'uppercase',
  },

  headline: {
    fontFamily: 'DMMonoMedium',
    fontSize: 38,
    letterSpacing: -1.5,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 42,
  },

  subtext: {
    fontFamily: 'DMSansRegular',
    fontSize: 15,
    color: '#8e9192',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Scan button
  scanWrapper: {
    width: SCAN_SIZE + 32,
    height: SCAN_SIZE + 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  outerRing: {
    position: 'absolute',
    width: SCAN_SIZE + 32,
    height: SCAN_SIZE + 32,
    borderRadius: (SCAN_SIZE + 32) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  scanButton: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: SCAN_SIZE / 2,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: '#131313',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 10,
  },
  scanLaser: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: '#ffffff',
    opacity: 0.35,
  },

  // Reticle icon (no external fonts needed)
  reticle: {
    width: 48,
    height: 48,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleCorner: {
    position: 'absolute',
    width: 12,
    height: 12,
  },
  reticleTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#ffffff' },
  reticleTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#ffffff' },
  reticleBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#ffffff' },
  reticleBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#ffffff' },
  reticleCenter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ffffff',
    opacity: 0.7,
  },

  scanLabel: {
    fontFamily: 'DMMonoMedium',
    fontSize: 10,
    letterSpacing: 4,
    color: '#ffffff',
    textTransform: 'uppercase',
  },

  // Bottom anchors
  anchors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  anchorText: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#444748',
    lineHeight: 16,
  },
});
