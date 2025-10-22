import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

function formatarTempo(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const min = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const sec = String(totalSec % 60).padStart(2, '0');
  return { hours, min, sec };
}

export default function CronometroScreen() {
  const router = useRouter();
  const [cronometro, setCronometro] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const iniciar = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setCronometro(prev => prev + 1000);
    }, 1000);
  };

  const pausar = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const zerar = () => {
    pausar();
    setCronometro(0);
  };

  const { hours, min, sec } = formatarTempo(cronometro);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cronômetro</Text>

      <View style={styles.timerBox}>
        <Text style={styles.timeText}>{hours}:{min}:{sec}</Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={iniciar} style={styles.btn}><Text style={styles.btnText}>Iniciar</Text></TouchableOpacity>
        <TouchableOpacity onPress={pausar} style={styles.btn}><Text style={styles.btnText}>Pausar</Text></TouchableOpacity>
        <TouchableOpacity onPress={zerar} style={styles.btn}><Text style={styles.btnText}>Zerar</Text></TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071025', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#ffb300', fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  timerBox: { backgroundColor: 'rgba(255,255,255,0.04)', padding: 24, borderRadius: 12, marginBottom: 24 },
  timeText: { color: '#fff', fontSize: 56, fontWeight: 'bold' },
  buttonsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  btn: { backgroundColor: 'rgba(255,179,0,0.12)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  backBtn: { marginTop: 8 },
  backText: { color: '#ffb300', fontWeight: 'bold' },
});