//IMPORTS
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';

function Jogo() {
  const router = useRouter();
  const handleLoginPress = () => {
    router.push('/login');
  };

  // Estados utilizados
  const [hora, setHora] = useState('');
  const [userMusicas, setUserMusicas] = useState([]);
  const [userMusicasLoading, setUserMusicasLoading] = useState(false);
  const [audiusTracks, setAudiusTracks] = useState([]);
  const [audiusLoading, setAudiusLoading] = useState(true);
  const [trackIdx, setTrackIdx] = useState(0);
  const [sound, setSound] = useState(null);
  const [tocando, setTocando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clima, setClima] = useState({ temperatura: '--', icone: '--' });
  const [localTracks, setLocalTracks] = useState([]);
  const [currentLocalTrack, setCurrentLocalTrack] = useState(null);
  const [showMusicContainer, setShowMusicContainer] = useState(false);
  const [showClimaDetail, setShowClimaDetail] = useState(false);

  // Ao tocar na batata do clima, abre/fecha detalhe
  const handleBatataClimaPress = () => {
    setShowClimaDetail(v => !v);
  };

  // Abrir/fechar container de música
  const toggleMusicContainer = () => {
    setShowMusicContainer(v => !v);
  };

  // Buscar músicas do usuário logado
  const BACKEND_IP = 'http://192.168.0.100:3001';
  const fetchUserMusicas = async () => {
    setUserMusicasLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_IP}/musicas`, {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      setUserMusicas(data);
    } catch (e) {
      setUserMusicas([]);
    }
    setUserMusicasLoading(false);
  };

  useEffect(() => {
    fetchUserMusicas();
  }, []);

  useEffect(() => {
    const updateHora = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateHora();
    const timer = setInterval(updateHora, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function getLocationAndFetchClima() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permissão de localização negada!');
          return;
        }
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        const { latitude, longitude } = location.coords;
        const apiKey = 'f69ab47389319d7de688f72898bde932';
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.main && data.weather) {
          let status = data.weather[0].main;
          let icone = '';
          if (status === 'Clear') icone = '☀️ Sol';
          else if (status === 'Rain' || status === 'Drizzle') icone = '🌧️ Chuva';
          else if (status === 'Clouds') icone = '☁️ Nublado';
          else icone = `${status}`;
          setClima({
            temperatura: `${Math.round(data.main.temp)}°C`,
            icone: icone
          });
        } else {
          setClima({
            temperatura: '--',
            icone: '--'
          });
          alert('Não foi possível obter o clima. Verifique a chave da API ou tente novamente.');
        }
      } catch (e) {
        setClima({ temperatura: '--', icone: '--' });
        alert('Erro ao obter o clima.');
      }
    }
    getLocationAndFetchClima();
  }, []);

  const fetchAudiusTracks = useCallback(async () => {
    setAudiusLoading(true);
    try {
      const res = await fetch('https://discoveryprovider.audius.co/v1/tracks/search?query=lofi&app_name=PROGRAMACAO-TCC&limit=20&with_users=true');
      const json = await res.json();
      const tracks = (json.data || []).filter(track => track.stream_url || track.permalink);
      setAudiusTracks(tracks);
    } catch (e) {
      setAudiusTracks([]);
    }
    setAudiusLoading(false);
  }, []);

  useEffect(() => {
    fetchAudiusTracks();
  }, [fetchAudiusTracks]);

  // Selecionar música do dispositivo
  const handleAddLocalMusic = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      console.log('Retorno do DocumentPicker:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLocalTracks(prev => [...prev, ...result.assets]);
        // Salvar cada música selecionada no backend
        for (const track of result.assets) {
          await handleSaveLocalTrack(track);
        }
      } else {
        alert('Seleção de arquivo não foi bem-sucedida.');
      }
    } catch (e) {
      alert('Erro ao selecionar música.');
      console.log('Erro ao selecionar música:', e);
    }
  };

  // Salvar música local no backend
  const handleSaveLocalTrack = async (track) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_IP}/musicas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ nome: track.name, caminho: track.uri })
      });
      if (res.ok) {
        await fetchUserMusicas();
        alert('Música salva!');
      } else {
        alert('Erro ao salvar música.');
      }
    } catch (e) {
      alert('Erro ao salvar música.');
    }
  };

  // Tocar música local e atualizar nome
  const playLocalTrack = async (track) => {
    if (loading) return;
    if (!track || !track.uri) return;
    setCurrentLocalTrack(track);
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setLoading(true);
    try {
      // Configura o modo de reprodução para background
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: track.uri });
      setSound(newSound);
      await newSound.playAsync();
      setTocando(true);
    } catch (e) {
      alert('Erro ao tentar tocar a música local.');
      console.log('Erro ao tocar música local:', e);
      setTocando(false);
    }
    setLoading(false);
  };

  const playAudiusTrack = async (url) => {
    if (loading) return;
    if (!url) {
      alert('Nenhum stream disponível para esta faixa.');
      return;
    }
    console.log('Tocando URL:', url);
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setLoading(true);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      await newSound.playAsync();
      setTocando(true);
    } catch (e) {
      alert('Erro ao tentar tocar a música.');
      setTocando(false);
    }
    setLoading(false);
  };

  const handlePlayPause = async () => {
    if (loading) return;
    // Se música local está selecionada, controla ela
    if (currentLocalTrack) {
      if (!sound) {
        await playLocalTrack(currentLocalTrack);
      } else if (tocando) {
        await sound.pauseAsync();
        setTocando(false);
      } else {
        await sound.playAsync();
        setTocando(true);
      }
      return;
    }
    // Caso contrário, controla Audius
    if (audiusTracks.length === 0) return;
    const track = audiusTracks[trackIdx];
    const streamUrl = track.stream_url || (track.permalink ? track.permalink + '/stream' : null);
    if (!sound) {
      await playAudiusTrack(streamUrl);
    } else if (tocando) {
      await sound.pauseAsync();
      setTocando(false);
    } else {
      // Ao despausar, apenas continua a música
      await sound.playAsync();
      setTocando(true);
    }
  };

  const handleNext = async () => {
    if (audiusTracks.length === 0) return;
    let nextIdx = (trackIdx + 1) % audiusTracks.length;
    setTrackIdx(nextIdx);
    const track = audiusTracks[nextIdx];
    const streamUrl = track.stream_url || (track.permalink ? track.permalink + '/stream' : null);
    await playAudiusTrack(streamUrl);
  };

  const handlePrev = async () => {
    if (audiusTracks.length === 0) return;
    let prevIdx = (trackIdx - 1 + audiusTracks.length) % audiusTracks.length;
    setTrackIdx(prevIdx);
    const track = audiusTracks[prevIdx];
    const streamUrl = track.stream_url || (track.permalink ? track.permalink + '/stream' : null);
    await playAudiusTrack(streamUrl);
  };

  return (
    <ImageBackground source={require('../assets/images/background2.gif')} style={styles.container} resizeMode="cover">
      {/* Botão de login no canto superior direito */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 32,
          right: 24,
          backgroundColor: 'rgba(255,255,255,0.15)',
          paddingVertical: 8,
          paddingHorizontal: 18,
          borderRadius: 12,
          zIndex: 20,
        }}
        onPress={handleLoginPress}
        activeOpacity={0.7}
      >
        <Text style={{ color: '#ffb300', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
      </TouchableOpacity>

      {/* Menu hamburger opaco */}
      <TouchableOpacity style={styles.hamburger} activeOpacity={0.5}>
        <View style={styles.burgerLine} />
        <View style={styles.burgerLine} />
        <View style={styles.burgerLine} />
      </TouchableOpacity>

      <View style={styles.grid}>
        {/* LINHA 1: Relógio + clima */}
        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.boxText}></Text>
          </View>

          <View style={styles.box}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleBatataClimaPress} style={styles.batataWrapper}>
              <View style={[styles.batataButton, { backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 16 }]}>
                <View style={styles.climaRelogioArea}>
                  <Text style={styles.climaText}>{clima.temperatura} {clima.icone}</Text>
                  <Text style={styles.relogio}>{hora}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* LINHA 3: Player Audius - AGORA CONDICIONAL */}
        {showMusicContainer && (
          <View style={styles.row}>
            <View style={styles.box}><Text style={styles.boxText}></Text></View>

            <View style={styles.box}>
              <View style={[styles.musicPlayerBg, { padding: 12, borderRadius: 16 }]}>
                {audiusLoading ? (
                  <Text style={styles.musicNow}>Carregando músicas...</Text>
                ) : audiusTracks.length === 0 ? (
                  <Text style={styles.musicNow}>Nenhuma música encontrada</Text>
                ) : (
                  <View>
                    <View style={styles.musicTop}>
                      {currentLocalTrack ? (
                        <View style={{ flex: 1 }}>
                          <Text style={styles.musicName}>{currentLocalTrack.name}</Text>
                          <Text style={styles.musicArtist}>Música do dispositivo</Text>
                        </View>
                      ) : (
                        <>
                          {audiusTracks[trackIdx]?.artwork && (
                            <Image source={{ uri: audiusTracks[trackIdx].artwork['150x150'] }} style={styles.musicImg} />
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={styles.musicName}>{audiusTracks[trackIdx]?.title}</Text>
                            <Text style={styles.musicArtist}>{audiusTracks[trackIdx]?.user?.name}</Text>
                          </View>
                        </>
                      )}
                    </View>

                    <View style={styles.musicControlsMenu}>
                      <TouchableOpacity onPress={handlePrev} style={styles.musicBtn} disabled={loading}>
                        <Image source={require('../assets/images/icons/musica/anterior.png')} style={{ width: 32, height: 32 }} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handlePlayPause} style={styles.musicBtn} disabled={loading}>
                        {loading ? (
                          <Text style={styles.musicBtnText}>...</Text>
                        ) : tocando ? (
                          <Image source={require('../assets/images/icons/musica/pause.png')} style={{ width: 32, height: 32 }} />
                        ) : (
                          <Image source={require('../assets/images/icons/musica/play.png')} style={{ width: 32, height: 32 }} />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleNext} style={styles.musicBtn} disabled={loading}>
                        <Image source={require('../assets/images/icons/musica/proxima.png')} style={{ width: 32, height: 32 }} />
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 12 }}>
                      <TouchableOpacity onPress={handleAddLocalMusic}>
                        <Image source={require('../assets/images/icons/musica/add.png')} style={{ width: 28, height: 28 }} />
                      </TouchableOpacity>
                      {localTracks.length > 0 && (
                        <TouchableOpacity onPress={() => {}}>
                          <Image source={require('../assets/images/icons/musica/list.png')} style={{ width: 28, height: 28 }} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={{ marginTop: 18 }}>
                      <Text style={{ color: '#ffb300', fontWeight: 'bold', fontSize: 16 }}>Minhas músicas salvas:</Text>
                      {userMusicasLoading ? (
                        <Text style={{ color: '#fff' }}>Carregando...</Text>
                      ) : userMusicas.length === 0 ? (
                        <Text style={{ color: '#fff' }}>Nenhuma música salva</Text>
                      ) : (
                        userMusicas.map(musica => (
                          <TouchableOpacity key={musica.id} style={{ padding: 8, marginVertical: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 }} onPress={async () => await playLocalTrack({ name: musica.nome, uri: musica.caminho })}>
                            <Text style={{ color: '#fff' }}>{musica.nome}</Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* BOTÃO: Abrir/fechar container de música */}
        <TouchableOpacity
          style={styles.musicToggleHitbox}
          activeOpacity={0.8}
          onPress={toggleMusicContainer}
        >
          <Text style={{ color: '#ffb300', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>
            {showMusicContainer ? 'Fechar' : 'Abrir'}{'\n'}Música
          </Text>
        </TouchableOpacity>

        {/* HITBOX: retângulo onde a pessoa ficará (toque para abrir tela do cronômetro) */}
        <TouchableOpacity
          style={styles.personHitbox}
          activeOpacity={0.8}
          onPress={() => router.push('/cronometro')}
        >
          <Text style={{ color: '#ffb300', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>Área do personagem{'\n'}(toque)</Text>
        </TouchableOpacity>

        {/* HITBOX: Personagem Focus - posicionada embaixo */}
        <TouchableOpacity
          style={styles.focusHitbox}
          activeOpacity={0.8}
          onPress={() => router.push('/focus')}
        >
          <Text style={{ color: '#ffb300', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>Foco{'\n'}(toque)</Text>
        </TouchableOpacity>
        
        {/* Detalhe do clima (overlay simples) */}
        {showClimaDetail && (
          <TouchableOpacity style={{
            position: 'absolute',
            top: 120,
            right: 24,
            zIndex: 9999,
          }} activeOpacity={1} onPress={() => setShowClimaDetail(false)}>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.85)', padding: 12, borderRadius: 12, minWidth: 180 }}>
              <Text style={{ color: '#ffb300', fontWeight: 'bold', marginBottom: 6 }}>Clima</Text>
              <Text style={{ color: '#fff' }}>{clima.temperatura} — {clima.icone}</Text>
              <Text style={{ color: '#ccc', marginTop: 8, fontSize: 12 }}>Toque para fechar</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}
export default Jogo;

const styles = StyleSheet.create({
  musicArtist: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  musicNow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  musicControlsMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16,
  },
  musicPlayerBg: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  musicImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  musicName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  musicBtn: {
    marginHorizontal: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  musicBtnText: {
    fontSize: 28,
    color: '#fff',
  },
  container: { flex: 1 },
  hamburger: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.25,
    zIndex: 10,
  },
  burgerLine: {
    width: 28,
    height: 4,
    backgroundColor: '#fff',
    marginVertical: 2,
    borderRadius: 2,
  },
  grid: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    marginBottom: 0,
  },
  box: {
    flex: 1,
    margin: 8,
    backgroundColor: 'transparent',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  boxText: {
    color: '#0a174e',
    fontSize: 32,
    fontWeight: 'bold',
  },
  climaRelogioArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  climaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  relogio: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 8,
  },
  batataWrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  batataButton: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  musicToggleHitbox: {
    position: 'absolute',
    width: 120,
    height: 80,
    right: '10%',
    top: '35%',
    borderWidth: 2,
    borderColor: '#ffb300',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,179,0,0.06)',
    zIndex: 15,
    padding: 4,
  },
  personHitbox: {
    position: 'absolute',
    width: 120,
    height: 250,
    left: '5%',
    top: '35%',
    borderWidth: 2,
    borderColor: '#ffb300',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,179,0,0.06)',
    zIndex: 15,
    padding: 8,
  },
  focusHitbox: {
    position: 'absolute',
    width: 200,
    height: 400,
    left: '45%',
    bottom: '5%',
    borderWidth: 2,
    borderColor: '#ffb300',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,179,0,0.06)',
    zIndex: 15,
    padding: 8,
  },
});