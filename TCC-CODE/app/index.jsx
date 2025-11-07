import { Text, View, Animated, TouchableOpacity, StyleSheet, Image, ImageBackground } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

export default function Index() {
  const router = useRouter();
  const [showEntrada, setShowEntrada] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!showEntrada) {
      // Modo Splash Screen
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }).start(() => {
          setShowEntrada(true);
        });
      }, 4000);

      return () => clearTimeout(timeout);
    } else {
      // Modo Tela de Entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();

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
    }
  }, [showEntrada]);

  const handleEnter = () => {
    if (isTransitioning.current || !showEntrada) return;
    isTransitioning.current = true;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/jogo");
    });
  };

  // Renderização da Splash Screen
  if (!showEntrada) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <Animated.Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            opacity: fadeAnim,
          }}
        >
          DevAssist presents...
        </Animated.Text>
      </View>
    );
  }

  // Renderização da Tela de Entrada
  return (
    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleEnter}>
      <AnimatedImageBackground
        source={require('../assets/images/wallpaper.png')}
        resizeMode="cover"
        style={[styles.container, { opacity: fadeAnim }]}
      >
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  procrasTopRight: {
    position: 'absolute',
    top: '18%',
    right: '8%',
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