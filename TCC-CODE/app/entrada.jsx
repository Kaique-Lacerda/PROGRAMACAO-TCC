import { View, Text, TouchableOpacity, Animated, StyleSheet, Image, ImageBackground } from "react-native";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

export default function Entrada() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isTransitioning = useRef(false);

  useEffect(() => {
    // Fade-in da tela de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Animação de pulsação
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleEnter = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/jogo");
    });
  };

  return (
    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleEnter}>
      <AnimatedImageBackground
        source={require('../assets/images/background2.gif')}
        resizeMode="cover"
        style={[styles.container, { opacity: fadeAnim }]}
      >
        {/* imagem "procras" maior e posicionada entre o meio e o canto superior direito */}
        <Image
          source={require('../assets/images/PROCRAS.png')}
          style={styles.procrasTopRight}
          resizeMode="contain"
          accessibilityLabel="Imagem procras"
        />

        <Animated.View style={[styles.bottom, { opacity: pulseAnim }]}>
          <Text style={styles.text}>Clique para entrar!</Text>
        </Animated.View>
      </AnimatedImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundImage substituído por ImageBackground; mantém alinhamento
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  neonBox: {
    // não usado mais, mantido para referência caso queira reutilizar
  },
  procras: {
    width: '70%',
    height: '45%',
  },
  procrasTopRight: {
    position: 'absolute',
    // posicionamento entre o meio e o topo-direito
    top: '18%',
    right: '8%',
    // maior que antes
    width: 140,
    height: 140,
    zIndex: 4,
  },
  bottom: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 48,
    zIndex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
