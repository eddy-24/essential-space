import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function ListRow({ label, subtitle, value, onPress, showArrow = true, danger = false }) {
  return (
    <TouchableOpacity
      style={styles.listRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={styles.listRowLeft}>
        <Text style={[styles.listRowLabel, danger && styles.listRowLabelDanger]}>{label}</Text>
        {subtitle ? <Text style={styles.listRowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.listRowRight}>
        {value ? <Text style={styles.listRowValue}>{value}</Text> : null}
        {showArrow && !danger && (
          <View style={styles.chevron}>
            <View style={styles.chevronInner} />
          </View>
        )}
        {danger && (
          <View style={styles.logoutIcon}>
            <View style={styles.logoutLine} />
            <View style={styles.logoutArrow} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function BrutalistToggle({ value, onValueChange }) {
  return (
    <TouchableOpacity
      style={[styles.toggle, value && styles.toggleActive]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </TouchableOpacity>
  );
}

function TagRow({ label, active }) {
  return (
    <TouchableOpacity style={styles.listRow} activeOpacity={0.6}>
      <View style={styles.listRowLeft}>
        <View style={styles.tagRowLeft}>
          <View style={[styles.tagDot, active && styles.tagDotActive]} />
          <Text style={styles.listRowLabel}>{label}</Text>
        </View>
      </View>
      <View style={styles.editIcon}>
        <View style={styles.editIconLine1} />
        <View style={styles.editIconLine2} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [autoTagging, setAutoTagging] = useState(true);
  const [saveOriginal, setSaveOriginal] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'SIGN OUT',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>SETTINGS</Text>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <SectionHeader title="ACCOUNT" />
          <View style={styles.listBlock}>
            <ListRow label="Profile Details" onPress={() => {}} />
            <ListRow label="Security & Authentication" onPress={() => {}} />
            <ListRow
              label="Subscription Plan"
              value="PRO"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* SCANNING PREFERENCES */}
        <View style={styles.section}>
          <SectionHeader title="SCANNING PREFERENCES" />
          <View style={styles.listBlock}>
            {/* Auto-tagging toggle */}
            <View style={styles.listRow}>
              <View style={styles.listRowLeft}>
                <Text style={styles.listRowLabel}>Auto-tagging</Text>
                <Text style={styles.listRowSubtitle}>Analyze images via local AI</Text>
              </View>
              <BrutalistToggle value={autoTagging} onValueChange={setAutoTagging} />
            </View>

            <ListRow
              label="OCR Language"
              subtitle="English (US)"
              onPress={() => {}}
            />

            {/* Save original toggle */}
            <View style={styles.listRow}>
              <View style={styles.listRowLeft}>
                <Text style={styles.listRowLabel}>Save Original Image</Text>
                <Text style={styles.listRowSubtitle}>Keep uncropped versions</Text>
              </View>
              <BrutalistToggle value={saveOriginal} onValueChange={setSaveOriginal} />
            </View>
          </View>
        </View>

        {/* TAG MANAGEMENT */}
        <View style={styles.section}>
          <SectionHeader title="TAG MANAGEMENT" />
          <View style={styles.listBlock}>
            <TagRow label="Grocery" active />
            <TagRow label="Wishlist" />
            <TagRow label="Event" />
            <TagRow label="Travel" />
            <TouchableOpacity style={styles.createTagRow} activeOpacity={0.7}>
              <Text style={styles.createTagText}>+ CREATE NEW TAG</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ABOUT */}
        <View style={styles.section}>
          <SectionHeader title="ABOUT" />
          <View style={styles.listBlock}>
            <ListRow label="App Information" onPress={() => {}} />
            <ListRow label="Privacy Policy" onPress={() => {}} showArrow={false} value="↗" />
            <ListRow
              label="Sign Out"
              danger
              showArrow={false}
              onPress={handleSignOut}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerData}>SYS_RDY</Text>
          <Text style={styles.footerVersion}>v.2.0.0 // ESSENTIAL SPACE</Text>
          <View style={styles.footerDivider} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#131313',
  },

  // Scroll
  scroll: {
    paddingBottom: 40,
  },

  // Page header
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444748',
    marginBottom: 0,
  },
  pageTitle: {
    fontFamily: 'DMMonoMedium',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -2,
    color: '#ffffff',
  },

  // Section
  section: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontFamily: 'DMMonoMedium',
    fontSize: 10,
    letterSpacing: 3,
    color: '#8e9192',
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  // List block
  listBlock: {
    borderTopWidth: 1,
    borderTopColor: '#353535',
  },

  // List row
  listRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#353535',
    paddingHorizontal: 4,
  },
  listRowLeft: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  listRowLabel: {
    fontFamily: 'DMSansRegular',
    fontSize: 16,
    color: '#e2e2e2',
  },
  listRowLabelDanger: {
    color: '#FF3B30',
  },
  listRowSubtitle: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    color: '#8e9192',
    letterSpacing: 0.3,
  },
  listRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listRowValue: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 1,
    color: '#8e9192',
    borderWidth: 1,
    borderColor: '#353535',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  // Chevron
  chevron: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronInner: {
    width: 8,
    height: 8,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: '#8e9192',
    transform: [{ rotate: '45deg' }],
  },

  // Logout icon
  logoutIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoutLine: {
    width: 10,
    height: 1.5,
    backgroundColor: '#FF3B30',
    position: 'absolute',
  },
  logoutArrow: {
    width: 6,
    height: 6,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: '#FF3B30',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    right: 2,
  },

  // Brutalist toggle
  toggle: {
    width: 48,
    height: 24,
    borderWidth: 1,
    borderColor: '#444748',
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    backgroundColor: '#444748',
  },
  toggleThumbActive: {
    backgroundColor: '#131313',
    transform: [{ translateX: 24 }],
  },

  // Tag rows
  tagRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tagDot: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#444748',
  },
  tagDotActive: {
    borderColor: '#ffffff',
  },
  editIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  editIconLine1: {
    width: 12,
    height: 1.5,
    backgroundColor: '#8e9192',
    transform: [{ rotate: '-45deg' }],
  },
  editIconLine2: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 6,
    height: 1.5,
    backgroundColor: '#8e9192',
  },

  // Create tag
  createTagRow: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#353535',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  createTagText: {
    fontFamily: 'DMMonoMedium',
    fontSize: 11,
    letterSpacing: 2,
    color: '#ffffff',
  },

  // Footer
  footer: {
    marginTop: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
    opacity: 0.5,
  },
  footerData: {
    fontFamily: 'DMMonoMedium',
    fontSize: 28,
    letterSpacing: 3,
    color: '#8e9192',
  },
  footerVersion: {
    fontFamily: 'DMMonoRegular',
    fontSize: 11,
    letterSpacing: 2,
    color: '#8e9192',
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#353535',
    marginTop: 16,
  },
});
