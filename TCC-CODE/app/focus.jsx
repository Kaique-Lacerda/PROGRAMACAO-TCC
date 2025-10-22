import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, ImageBackground, SafeAreaView, Image } from 'react-native';

export default function Focus() {
  const [showSplit, setShowSplit] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // sequência total ~6000ms: entrar (600) -> manter (4800) -> sair (600)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(4800),
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      setShowSplit(true);
    });

    return () => {
      opacity.stopAnimation?.();
      translateY.stopAnimation?.();
    };
  }, [opacity, translateY]);

  return (
    <ImageBackground
      source={require('../assets/images/background2.gif')}
      style={styles.bg}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <SafeAreaView style={styles.safe}>
        {/* Tela dividida horizontal (esquerda maior, direita menor) */}
        <View style={styles.wrapper}>
          <View style={styles.leftContainer}>
            <Text style={styles.title}>Área Esquerda</Text>
            <Text style={styles.subtitle}>Aqui ficará a animação GIF grande quando pronta</Text>
          </View>

          <View style={styles.rightContainer}>
            <Text style={styles.titleSmall}>Área Direita</Text>
            <Text style={styles.helper}>Informações, botões ou controles</Text>
          </View>
        </View>

        {/* Overlay de animação inicial que some após ~6s */}
        {!showSplit && (
          <Animated.View
            style={[
              styles.overlay,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            {/* Usando background2.gif como placeholder da animação */}
            <Image source={require('../assets/images/background2.gif')} style={styles.animImage} />
            <View style={styles.overlayTextWrap}>
              <Text style={styles.overlayTitle}>Animação de Abertura</Text>
              <Text style={styles.overlaySubtitle}>Aguarde...</Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1 },

  // wrapper agora em linha (horizontal)
  wrapper: { flex: 1, paddingHorizontal: 18, paddingVertical: 24, flexDirection: 'row', gap: 12 },

  leftContainer: {
    flex: 2, // esquerda maior
    marginRight: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  rightContainer: {
    flex: 1, // direita menor
    marginLeft: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },

  title: { color: '#ffb300', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#fff', opacity: 0.85, textAlign: 'center' },
  titleSmall: { color: '#ffb300', fontSize: 16, fontWeight: '600' },
  helper: { color: '#fff', opacity: 0.8, marginTop: 6, textAlign: 'center' },

  /* overlay de animação inicial */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,16,37,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  animImage: {
    width: 260,
    height: 260,
    marginBottom: 18,
    borderRadius: 12,
  },
  overlayTextWrap: { alignItems: 'center' },
  overlayTitle: { color: '#ffb300', fontSize: 22, fontWeight: 'bold' },
  overlaySubtitle: { color: '#fff', marginTop: 6, opacity: 0.85 },
});