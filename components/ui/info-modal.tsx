import { Colors, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export function InfoModal({ visible, onClose, title, children }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            Shadows.card,
            {
              backgroundColor: colors.modalBackground,
              borderColor: colors.tint,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{title ?? 'Информация'}</Text>
          <View style={styles.content}>{children}</View>
          <TouchableOpacity
            style={[styles.close, { backgroundColor: colors.tint, borderColor: colors.tint }]}
            onPress={onClose}
          >
            <Text style={styles.closeText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 720,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'TikTokSans-Bold',
    marginBottom: 10,
  },
  content: {
    marginBottom: 14,
  },
  close: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'TikTokSans-SemiBold',
  },
});

export default InfoModal;
