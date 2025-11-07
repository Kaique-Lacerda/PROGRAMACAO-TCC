import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

const WeatherWidget = ({ clima, onPress }) => {
  const [showDetail, setShowDetail] = useState(false);

  const handlePress = () => {
    setShowDetail(!showDetail);
    if (onPress) onPress(!showDetail);
  };

  return (
    <>
      <TouchableOpacity 
        activeOpacity={0.85} 
        onPress={handlePress} 
        style={styles.weatherWrapper}
      >
        <View style={[styles.weatherButton, { backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 16 }]}>
          <View style={styles.weatherArea}>
            <Text style={styles.weatherText}>{clima.temperatura} {clima.icone}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Detalhe do clima */}
      {showDetail && (
        <TouchableOpacity 
          style={styles.weatherDetail} 
          activeOpacity={1} 
          onPress={() => setShowDetail(false)}
        >
          <View style={styles.weatherDetailContent}>
            <Text style={styles.weatherDetailTitle}>Clima</Text>
            <Text style={styles.weatherDetailText}>{clima.temperatura} — {clima.icone}</Text>
            <Text style={styles.weatherDetailHint}>Toque para fechar</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  weatherWrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  weatherButton: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  weatherArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  weatherDetail: {
    position: 'absolute',
    top: 120,
    right: 24,
    zIndex: 9999,
  },
  weatherDetailContent: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 12,
    borderRadius: 12,
    minWidth: 180,
  },
  weatherDetailTitle: {
    color: '#ffb300',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  weatherDetailText: {
    color: '#fff',
  },
  weatherDetailHint: {
    color: '#ccc',
    marginTop: 8,
    fontSize: 12,
  },
});

export default WeatherWidget;