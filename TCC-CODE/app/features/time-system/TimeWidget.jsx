import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';

const TimeWidget = ({ hora, cenarioAtual }) => {
  return (
    <View style={styles.timeContainer}>
      {/* Info do cenário atual */}
      <View style={styles.cenarioInfo}>
        <Text style={styles.cenarioText}>
          🌅 {cenarioAtual.replace('_', ' ')}
        </Text>
      </View>

      {/* Relógio */}
      <View style={styles.clockArea}>
        <Text style={styles.clockText}>{hora}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cenarioInfo: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  cenarioText: {
    color: '#ffb300',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clockArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});

export default TimeWidget;