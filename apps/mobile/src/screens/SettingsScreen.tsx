import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useUserStore, useBibleStore } from '@bible/shared';

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useUserStore();
  const { versions } = useBibleStore();

  const handleThemeChange = () => {
    const themes = ['light', 'dark', 'auto'] as const;
    const currentIndex = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updateSettings({ theme: nextTheme });
  };

  const handleFontSizeChange = (increase: boolean) => {
    const newSize = increase 
      ? Math.min(settings.fontSize + 2, 24)
      : Math.max(settings.fontSize - 2, 12);
    updateSettings({ fontSize: newSize });
  };

  const handleFontFamilyChange = () => {
    const fonts = ['serif', 'sans-serif', 'monospace'] as const;
    const currentIndex = fonts.indexOf(settings.fontFamily);
    const nextFont = fonts[(currentIndex + 1) % fonts.length];
    updateSettings({ fontFamily: nextFont });
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: resetSettings
        },
      ]
    );
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#007AFF" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (onPress && <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Reading Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading</Text>
          
          <SettingRow
            icon="color-palette"
            title="Theme"
            subtitle={`Current: ${settings.theme}`}
            onPress={handleThemeChange}
          />
          
          <SettingRow
            icon="text"
            title="Font Size"
            subtitle={`${settings.fontSize}px`}
            rightComponent={
              <View style={styles.fontSizeControls}>
                <TouchableOpacity
                  style={styles.fontSizeButton}
                  onPress={() => handleFontSizeChange(false)}
                >
                  <Ionicons name="remove" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fontSizeButton}
                  onPress={() => handleFontSizeChange(true)}
                >
                  <Ionicons name="add" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            }
          />
          
          <SettingRow
            icon="text"
            title="Font Family"
            subtitle={settings.fontFamily}
            onPress={handleFontFamilyChange}
          />
          
          <SettingRow
            icon="book"
            title="Default Bible Version"
            subtitle={settings.defaultBibleVersion}
          />
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <SettingRow
            icon="library"
            title="Parallel Reading"
            subtitle="Read two versions side by side"
            rightComponent={
              <Switch
                value={settings.enableParallelReading}
                onValueChange={(value) => updateSettings({ enableParallelReading: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#fff"
              />
            }
          />
          
          <SettingRow
            icon="volume-high"
            title="Voice Narration"
            subtitle="Enable text-to-speech"
            rightComponent={
              <Switch
                value={settings.enableVoiceNarration}
                onValueChange={(value) => updateSettings({ enableVoiceNarration: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#fff"
              />
            }
          />
          
          <SettingRow
            icon="notifications"
            title="Daily Reminder"
            subtitle="Get reminded to read daily"
            rightComponent={
              <Switch
                value={settings.dailyReminder}
                onValueChange={(value) => updateSettings({ dailyReminder: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Data & Sync */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          
          <SettingRow
            icon="cloud"
            title="Auto Sync"
            subtitle="Automatically sync your data"
            rightComponent={
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => updateSettings({ autoSync: value })}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#fff"
              />
            }
          />
          
          <SettingRow
            icon="download"
            title="Download Bible Versions"
            subtitle="Manage offline content"
          />
          
          <SettingRow
            icon="cloud-upload"
            title="Backup Data"
            subtitle="Export your notes and highlights"
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingRow
            icon="information-circle"
            title="App Version"
            subtitle="1.0.0"
          />
          
          <SettingRow
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help using the app"
          />
          
          <SettingRow
            icon="document-text"
            title="Privacy Policy"
            subtitle="How we handle your data"
          />
          
          <SettingRow
            icon="shield-checkmark"
            title="Terms of Service"
            subtitle="App usage terms"
          />
        </View>

        {/* Reset */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
            <Text style={styles.resetButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fontSizeControls: {
    flexDirection: 'row',
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
