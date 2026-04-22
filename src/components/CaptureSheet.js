import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable, Easing,
} from 'react-native';
import { C } from '../design/colors';
import { IcCapScreenshot, IcCapLink, IcCapNote, IcCapFile } from './Icons';

const SHEET_HEIGHT = 320;

export const CaptureSheet = ({ visible, onClose, onNote, onLink, onScreenshot, onFile }) => {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 320,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const BUTTONS = [
    { label: 'screenshot', Icon: IcCapScreenshot, action: onScreenshot },
    { label: 'link',       Icon: IcCapLink,       action: onLink },
    { label: 'note',       Icon: IcCapNote,       action: onNote },
    { label: 'file',       Icon: IcCapFile,       action: onFile },
  ];

  return (
    <>
      <Animated.View
        style={[s.overlay, { opacity: overlayOpacity }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <View style={s.handle} />
        <Text style={s.label}>quick capture</Text>
        <View style={s.grid}>
          {BUTTONS.map(({ label, Icon, action }) => (
            <TouchableOpacity
              key={label}
              style={s.capBtn}
              activeOpacity={0.75}
              onPress={() => {
                onClose();
                action?.();
              }}
            >
              <View style={s.capIcon}>
                <Icon />
              </View>
              <Text style={s.capLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
};

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 80,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#141312',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 0.5,
    borderTopColor: C.borderMedium,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 52,
    zIndex: 90,
  },
  handle: {
    width: 32,
    height: 3,
    backgroundColor: '#282624',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  label: {
    fontFamily: 'DMMonoRegular',
    fontSize: 9,
    color: C.textDarker,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  capBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: C.elevated,
    borderWidth: 0.5,
    borderColor: C.borderMedium,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
  },
  capIcon: {
    opacity: 0.9,
  },
  capLabel: {
    fontFamily: 'DMMonoRegular',
    fontSize: 10,
    color: '#6A6764',
    letterSpacing: 0.5,
  },
});
