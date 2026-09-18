import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  Vibration, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

type Trofeo = {
  id: string;
  titolo: string;
  desc: string;
  sbloccato: boolean;
  icona: string;
};

// --- COMPONENTE PARTICELLE VOLANTI ---
function CuoricinoVolante({ id, xOffset, isFuria, onFinish }: { id: number; xOffset: number; isFuria: boolean; onFinish: (id: number) => void }) {
  const animY = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: -200,
        duration: isFuria ? 350 : 700,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: isFuria ? 350 : 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish(id);
    });
  }, []);

  return (
    <Animated.Text
      style={[
        styles.cuore,
        {
          transform: [
            { translateY: animY },
            { translateX: xOffset },
          ],
          opacity: animOpacity,
        },
      ]}
    >
      {isFuria ? '⚡' : '❤️'}
    </Animated.Text>
  );
}

// --- SCHERMATA PRINCIPALE: GIOCO ---
function HomeScreen({ navigation }: any) {
  const isFocused = useIsFocused();

  const [clickCount, setClickCount] = useState(0);
  const [fumettoTesto, setFumettoTesto] = useState('Portami a 50 cuori per sbloccare il Ki! 🥋');
  const [cuori, setCuori] = useState<{ id: number; xOffset: number }[]>([]);

  // STATS DI GIOCO PER I TROFEI
  const saiyanAttivati = useRef(0);
  const qteSalvati = useRef(0);
  const tapConsecutivi = useRef(0);
  const timerCombo = useRef<NodeJS.Timeout | null>(null);

  // LOGICA SUPER SAIYAN
  const SOGLIA_SAIYAN = 50;
  const [isFuria, setIsFuria] = useState(false);
  const [tempoFuria, setTempoFuria] = useState(10);

  // LOGICA QUICK TIME EVENT (QTE)
  const [qteAttivo, setQteAttivo] = useState(false);
  const [qteCountdown, setQteCountdown] = useState(25);

  // BACHECA 10 TROFEI
  const [trofei, setTrofei] = useState<Trofeo[]>([
    { id: 'primo', titolo: 'Primo Contatto', desc: 'Fai il tuo primissimo tap sul Pule', sbloccato: false, icona: '✨' },
    { id: 'combo15', titolo: 'Dita Nervose', desc: 'Fai 15 tap veloci di fila', sbloccato: false, icona: '⚡' },
    { id: 'combo30', titolo: 'Velocità della Luce', desc: 'Fai 30 tap veloci senza fermarti', sbloccato: false, icona: '💨' },
    { id: 'berserker', titolo: 'Super Saiyan', desc: 'Risveglia l\'aura dorata a 50 cuori', sbloccato: false, icona: '🔥' },
    { id: 'saiyan_pro', titolo: 'Guerriero Z Veterano', desc: 'Attiva la modalità Saiyan per 3 volte', sbloccato: false, icona: '🌟' },
    { id: 'salvatore', titolo: 'Riflessi Fulminei', desc: 'Salva il Pule in tempo durante la caduta', sbloccato: false, icona: '🛡️' },
    { id: 'eroe', titolo: 'Angelo Custode', desc: 'Salva il Pule per 3 volte dai QTE', sbloccato: false, icona: '👼' },
    { id: '50pt', titolo: 'Mezzo Secolo', desc: 'Raggiungi 50 cuori accumulati', sbloccato: false, icona: '🥉' },
    { id: '100pt', titolo: 'Cento di Questi Cuori', desc: 'Accumula 100 punti Ki', sbloccato: false, icona: '🥇' },
    { id: 'reset', titolo: 'Pule a Pressione', desc: 'Azzera i punti e rilascia il gas', sbloccato: false, icona: '💨' },
  ]);

  // CANALI E TRACCE AUDIO
  const currentSoundRef = useRef<Sound | null>(null);

  const soundApple = useRef<Sound | null>(null);
  const soundAura = useRef<Sound | null>(null);
  const soundCagato = useRef<Sound | null>(null);
  const soundGta = useRef<Sound | null>(null);
  const soundGerman = useRef<Sound | null>(null);
  const soundLetto = useRef<Sound | null>(null);
  const soundSaiyan = useRef<Sound | null>(null);
  const soundFart = useRef<Sound | null>(null);

  const ultimoTapAudio = useRef<number>(0);

  // ANIMAZIONI
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const auraScaleAnim = useRef(new Animated.Value(1)).current;
  const auraOpacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!isFocused) {
      fermaTutto();
    }
  }, [isFocused]);

  useEffect(() => {
    soundApple.current = new Sound('applepay.mp3', Sound.MAIN_BUNDLE, () => {});
    soundAura.current = new Sound('aura.mp3', Sound.MAIN_BUNDLE, () => {});
    soundCagato.current = new Sound('cagato.mp3', Sound.MAIN_BUNDLE, () => {});
    soundGta.current = new Sound('gta.mp3', Sound.MAIN_BUNDLE, () => {});
    soundGerman.current = new Sound('german.mp3', Sound.MAIN_BUNDLE, () => {});
    soundLetto.current = new Sound('letto.mp3', Sound.MAIN_BUNDLE, () => {});
    soundSaiyan.current = new Sound('saiyan.mp3', Sound.MAIN_BUNDLE, () => {});
    soundFart.current = new Sound('fart.mp3', Sound.MAIN_BUNDLE, () => {});

    return () => {
      fermaTutto();
      soundApple.current?.release();
      soundAura.current?.release();
      soundCagato.current?.release();
      soundGta.current?.release();
      soundGerman.current?.release();
      soundLetto.current?.release();
      soundSaiyan.current?.release();
      soundFart.current?.release();
    };
  }, []);

  useEffect(() => {
    let auraLoop: Animated.CompositeAnimation;
    if (isFuria) {
      auraLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(auraScaleAnim, { toValue: 1.35, duration: 300, useNativeDriver: true }),
            Animated.timing(auraScaleAnim, { toValue: 1.05, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(auraOpacityAnim, { toValue: 0.85, duration: 300, useNativeDriver: true }),
            Animated.timing(auraOpacityAnim, { toValue: 0.35, duration: 300, useNativeDriver: true }),
          ]),
        ])
      );
      auraLoop.start();
    } else {
      auraScaleAnim.setValue(1);
      auraOpacityAnim.setValue(0);
    }
    return () => auraLoop?.stop();
  }, [isFuria]);

  const fermaTutto = () => {
    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current = null;
    }
  };

  const riproduciAudioUnico = (suono: Sound | null, loop: boolean = false) => {
    if (!suono) return;
    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
    }
    currentSoundRef.current = suono;
    suono.setNumberOfLoops(loop ? -1 : 0);
    suono.setCurrentTime(0);
    suono.play(() => {
      if (currentSoundRef.current === suono) {
        currentSoundRef.current = null;
      }
    });
  };

  // Suono tap con probabilità personalizzate
  const suonaTapCasuale = () => {
    const adesso = Date.now();
    if (adesso - ultimoTapAudio.current < 90) return;
    ultimoTapAudio.current = adesso;

    const r = Math.random();
    let audioScelto: Sound | null = null;

    if (r < 0.03) {
      audioScelto = soundLetto.current;   // Chicca ultra-rara (3%)
    } else if (r < 0.18) {
      audioScelto = soundCagato.current;  // Meno probabile (15%)
    } else if (r < 0.59) {
      audioScelto = soundGta.current;     // Standard (41%)
    } else {
      audioScelto = soundApple.current;   // Standard (41%)
    }

    if (audioScelto) {
      audioScelto.stop(() => {
        audioScelto?.setCurrentTime(0);
        audioScelto?.play();
      });
    }
  };

  const sbloccaTrofeo = (id: string) => {
    setTrofei((prev) => 
      prev.map((t) => {
        if (t.id === id && !t.sbloccato) {
          Vibration.vibrate([0, 80, 50, 80]);
          return { ...t, sbloccato: true };
        }
        return t;
      })
    );
  };

  // Timer Super Saiyan
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFuria && tempoFuria > 0) {
      timer = setInterval(() => {
        setTempoFuria((prev) => prev - 1);
      }, 1000);
    } else if (tempoFuria === 0 && isFuria) {
      setIsFuria(false);
      setTempoFuria(10);
      fermaTutto();
      setFumettoTesto('L\'aura si è spenta... Pule torna calmo 🧘');
    }
    return () => clearInterval(timer);
  }, [isFuria, tempoFuria]);

  // Timer QTE
  useEffect(() => {
    let timerQte: NodeJS.Timeout;
    if (qteAttivo && qteCountdown > 0) {
      timerQte = setInterval(() => {
        setQteCountdown((prev) => prev - 1);
      }, 100);
    } else if (qteCountdown === 0 && qteAttivo) {
      setQteAttivo(false);
      fermaTutto();
      riproduciAudioUnico(soundLetto.current, false);
      Vibration.vibrate(400);
      setFumettoTesto('💥 VAI A LETTO! Pule è caduto rovinosamente!');
      setClickCount((prev) => Math.max(0, prev - 5));
    }
    return () => clearInterval(timerQte);
  }, [qteAttivo, qteCountdown]);

  const animaBattito = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 130, useNativeDriver: true }),
    ]).start();
  };

  const animaShakeSaiyan = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 30, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 30, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
  };

  const generaCuore = () => {
    const nuovoCuore = {
      id: Date.now() + Math.random(),
      xOffset: Math.floor(Math.random() * 120) - 60,
    };
    setCuori((prev) => [...prev, nuovoCuore]);
  };

  const rimuoviCuore = (idDaRimuovere: number) => {
    setCuori((prev) => prev.filter((c) => c.id !== idDaRimuovere));
  };

  const attivaModalitaSaiyan = () => {
    setIsFuria(true);
    setTempoFuria(10);
    saiyanAttivati.current += 1;
    sbloccaTrofeo('berserker');
    if (saiyanAttivati.current >= 3) sbloccaTrofeo('saiyan_pro');

    setFumettoTesto('⚡ SUPER SAIYAN RISVEGLIATO! PUNTI x3! ⚡');
    Vibration.vibrate([0, 150, 100, 200, 100, 300]);
    
    riproduciAudioUnico(soundSaiyan.current, false);
    setTimeout(() => {
      if (isFuria || tempoFuria > 0) {
        riproduciAudioUnico(soundAura.current, true);
      }
    }, 1200);
  };

  const risolviQte = () => {
    setQteAttivo(false);
    fermaTutto();
    qteSalvati.current += 1;
    sbloccaTrofeo('salvatore');
    if (qteSalvati.current >= 3) sbloccaTrofeo('eroe');

    Vibration.vibrate(150);
    setClickCount((prev) => {
      const nuovo = prev + 15;
      if (nuovo >= 50) sbloccaTrofeo('50pt');
      if (nuovo >= 100) sbloccaTrofeo('100pt');
      return nuovo;
    });
    setFumettoTesto('🛡️ PRESO AL VOLO! Pule è salvo (+15 Ki)!');
  };

  const gestisciComboTap = () => {
    tapConsecutivi.current += 1;
    if (tapConsecutivi.current >= 15) sbloccaTrofeo('combo15');
    if (tapConsecutivi.current >= 30) sbloccaTrofeo('combo30');

    if (timerCombo.current) clearTimeout(timerCombo.current);
    timerCombo.current = setTimeout(() => {
      tapConsecutivi.current = 0;
    }, 1200);
  };

  const premiPulsante = () => {
    generaCuore();
    gestisciComboTap();
    sbloccaTrofeo('primo');

    if (!qteAttivo && !isFuria && Math.random() < 0.03 && clickCount >= 15) {
      setQteAttivo(true);
      setQteCountdown(25);
      Vibration.vibrate([0, 150, 100, 150]);
      riproduciAudioUnico(soundGerman.current, true);
      return;
    }

    if (isFuria) {
      Vibration.vibrate(30);
      animaShakeSaiyan();
      animaBattito();
      setClickCount((prev) => {
        const nuovo = prev + 3;
        if (nuovo >= 50) sbloccaTrofeo('50pt');
        if (nuovo >= 100) sbloccaTrofeo('100pt');
        return nuovo;
      });
    } else {
      suonaTapCasuale();

      Vibration.vibrate(45);
      animaBattito();
      
      const nuovoConteggio = clickCount + 1;
      setClickCount(nuovoConteggio);

      if (nuovoConteggio > 0 && nuovoConteggio % SOGLIA_SAIYAN === 0) {
        attivaModalitaSaiyan();
        return;
      }

      if (nuovoConteggio >= 50) sbloccaTrofeo('50pt');
      if (nuovoConteggio >= 100) sbloccaTrofeo('100pt');

      const frasi = [
        'Il Ki del Pule sta salendo...',
        'Pule sta concentrando l\'energia!',
        'Aura in costante crescita...',
        'Ancora qualche tap verso il livello leggendario.',
      ];
      setFumettoTesto(frasi[Math.floor(Math.random() * frasi.length)]);
    }
  };

  // Reset con attivazione garantita di fart.mp3
  const resettaAmore = () => {
    fermaTutto();

    if (soundFart.current) {
      soundFart.current.stop(() => {
        soundFart.current?.setCurrentTime(0);
        soundFart.current?.setNumberOfLoops(0);
        soundFart.current?.play();
      });
    }

    Vibration.vibrate(300);
    sbloccaTrofeo('reset');
    setClickCount(0);
    setIsFuria(false);
    setQteAttivo(false);
    setTempoFuria(10);
    setCuori([]);
    setFumettoTesto('Amore azzerato... Pule ha rilasciato la pressione 💨');
  };

  const progressVersoSaiyan = (clickCount % SOGLIA_SAIYAN) / SOGLIA_SAIYAN;

  return (
    <View style={[styles.container, { backgroundColor: isFuria ? '#181202' : '#f9fafb' }]}>
      {qteAttivo && (
        <View style={styles.qteOverlay}>
          <Text style={styles.qteTitolo}>⚠️ ALLARME: PULE IN CADUTA! ⚠️</Text>
          <Text style={styles.qteTempo}>Tempo: {(qteCountdown / 10).toFixed(1)}s</Text>
          <TouchableOpacity 
            style={styles.qteBottone} 
            activeOpacity={0.7}
            onPress={risolviQte}
          >
            <Text style={styles.qteTestoBottone}>AFFERRALO ORA! 🛡️</Text>
          </TouchableOpacity>
        </View>
      )}

      {isFuria ? (
        <View style={styles.bannerSaiyan}>
          <Text style={styles.testoBannerSaiyan}>⚡ SUPER SAIYAN: {tempoFuria}s (PUNTI x3) ⚡</Text>
        </View>
      ) : (
        <View style={styles.caricaKiBox}>
          <Text style={styles.testoCarica}>
            Progresso Ki: {clickCount % SOGLIA_SAIYAN}/{SOGLIA_SAIYAN} verso il Saiyan
          </Text>
          <View style={styles.barraSfondo}>
            <View style={[styles.barraRiempita, { width: `${progressVersoSaiyan * 100}%` }]} />
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.fumettoContainer} 
        activeOpacity={0.8}
        onPress={premiPulsante}
      >
        <View style={[styles.fumetto, isFuria && styles.fumettoSaiyan]}>
          <Text style={[styles.testoFumetto, isFuria && styles.testoFumettoSaiyan]}>{fumettoTesto}</Text>
        </View>
        <View style={[styles.frecciaFumetto, isFuria && styles.frecciaFumettoSaiyan]} />
      </TouchableOpacity>

      <View style={styles.avatarWrapper}>
        {isFuria && (
          <Animated.View 
            style={[
              styles.auraSaiyan,
              {
                transform: [{ scale: auraScaleAnim }],
                opacity: auraOpacityAnim,
              }
            ]} 
          />
        )}

        <TouchableOpacity activeOpacity={0.9} onPress={premiPulsante}>
          <Animated.Image 
            source={require('./assets/pule.jpg')} 
            style={[
              styles.avatar, 
              isFuria && styles.avatarSaiyan,
              { 
                transform: [
                  { scale: scaleAnim },
                  { translateX: shakeAnim },
                ] 
              }
            ]} 
          />
        </TouchableOpacity>

        {cuori.map((cuore) => (
          <CuoricinoVolante
            key={cuore.id}
            id={cuore.id}
            isFuria={isFuria}
            xOffset={cuore.xOffset}
            onFinish={rimuoviCuore}
          />
        ))}
      </View>

      <Text style={[styles.titolo, { color: isFuria ? '#fbbf24' : '#111827' }]}>
        {isFuria ? '⚡ SUPER PULE SAIYAN ⚡' : 'Il Pule ❤️'}
      </Text>

      <Text style={[styles.sottotitolo, { color: isFuria ? '#fde68a' : '#4b5563' }]}>
        Cuori / Livello Ki: {clickCount}
      </Text>
      
      <TouchableOpacity 
        style={[styles.bottoneCustom, isFuria && styles.bottoneSaiyan]} 
        activeOpacity={0.7} 
        onPress={premiPulsante}
      >
        <Text style={[styles.testoBottone, isFuria && styles.testoBottoneSaiyan]}>
          {isFuria ? 'SCATENA IL KI! ⚡' : 'Dai carica al Pule'}
        </Text>
      </TouchableOpacity>

      <View style={styles.rigaBottoni}>
        <TouchableOpacity 
          style={styles.bottoneNavigazione} 
          activeOpacity={0.8}
          onPress={() => {
            fermaTutto();
            navigation.navigate('Statistiche', {
              punti: clickCount,
              rango: isFuria ? 'Super Saiyan ⚡' : 'Allievo 🥋',
              furiaAttiva: isFuria,
            });
          }}
        >
          <Text style={styles.testoNavigazione}>Stats 📊</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottoneTrofei} 
          activeOpacity={0.8}
          onPress={() => {
            fermaTutto();
            navigation.navigate('Trofei', { listaTrofei: trofei });
          }}
        >
          <Text style={styles.testoNavigazione}>
            Trofei 🏆 ({trofei.filter((t) => t.sbloccato).length}/10)
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.bottoneReset} 
        activeOpacity={0.6} 
        onPress={resettaAmore}
      >
        <Text style={styles.testoReset}>Azzera Ki 🔄</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- SCHERMATA BACHECA TROFEI: SUONA DU.MP3 (NO LOOP) ---
function TrofeiScreen({ route, navigation }: any) {
  const { listaTrofei } = route.params;
  const isFocused = useIsFocused();
  const bgmRef = useRef<Sound | null>(null);

  useEffect(() => {
    if (isFocused) {
      bgmRef.current = new Sound('du.mp3', Sound.MAIN_BUNDLE, (err) => {
        if (!err) {
          bgmRef.current?.setNumberOfLoops(0);
          bgmRef.current?.play();
        }
      });
    } else {
      bgmRef.current?.stop();
    }

    return () => {
      bgmRef.current?.stop();
      bgmRef.current?.release();
    };
  }, [isFocused]);

  const sbloccati = listaTrofei.filter((t: Trofeo) => t.sbloccato).length;

  return (
    <ScrollView contentContainerStyle={styles.trofeiContainer}>
      <Text style={styles.trofeiTitolo}>Bacheca Trofei 🏆</Text>
      <Text style={styles.trofeiSottotitolo}>
        Progresso completamento: {sbloccati} su {listaTrofei.length}
      </Text>

      {listaTrofei.map((item: Trofeo) => (
        <View 
          key={item.id} 
          style={[styles.trofeoCard, item.sbloccato ? styles.trofeoSbloccatoCard : styles.trofeoBloccatoCard]}
        >
          <Text style={styles.trofeoIcona}>{item.sbloccato ? item.icona : '🔒'}</Text>
          <View style={styles.trofeoDettagli}>
            <Text style={[styles.trofeoNome, item.sbloccato && styles.trofeoNomeSbloccato]}>
              {item.titolo}
            </Text>
            <Text style={styles.trofeoDesc}>{item.desc}</Text>
          </View>
          <Text style={[styles.trofeoStato, item.sbloccato && styles.trofeoStatoSbloccato]}>
            {item.sbloccato ? 'SBLOCCATO' : 'BLOCCATO'}
          </Text>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.bottoneRitorno} 
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.testoRitorno}>Torna al Gioco 👈</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- SCHERMATA STATISTICHE: SUONA SPIDERMAN.MP3 (NO LOOP) ---
function StatsScreen({ route, navigation }: any) {
  const { punti, rango, furiaAttiva } = route.params;
  const isFocused = useIsFocused();
  const bgmRef = useRef<Sound | null>(null);

  useEffect(() => {
    if (isFocused) {
      bgmRef.current = new Sound('spiderman.mp3', Sound.MAIN_BUNDLE, (err) => {
        if (!err) {
          bgmRef.current?.setNumberOfLoops(0);
          bgmRef.current?.play();
        }
      });
    } else {
      bgmRef.current?.stop();
    }

    return () => {
      bgmRef.current?.stop();
      bgmRef.current?.release();
    };
  }, [isFocused]);

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitolo}>Scheda Guerriero</Text>

      <View style={styles.cardStat}>
        <Text style={styles.labelStat}>Nome:</Text>
        <Text style={styles.valoreStat}>Pule (Guerriero Z)</Text>
      </View>

      <View style={styles.cardStat}>
        <Text style={styles.labelStat}>Livello Ki:</Text>
        <Text style={styles.valoreStat}>{punti}</Text>
      </View>

      <View style={styles.cardStat}>
        <Text style={styles.labelStat}>Stato:</Text>
        <Text style={styles.valoreStat}>{rango}</Text>
      </View>

      <View style={styles.cardStat}>
        <Text style={styles.labelStat}>Aura:</Text>
        <Text style={styles.valoreStat}>
          {furiaAttiva ? 'SUPER SAIYAN ATTIVO ⚡' : 'Normale 😌'}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.bottoneRitorno} 
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.testoRitorno}>Torna all'allenamento 👈</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- STACK DI NAVIGAZIONE PRINCIPALE ---
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PuleHome"
        screenOptions={{
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fbbf24',
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen 
          name="PuleHome" 
          component={HomeScreen} 
          options={{ title: 'Pule Saiyan Clicker' }} 
        />
        <Stack.Screen 
          name="Trofei" 
          component={TrofeiScreen} 
          options={{ title: 'Bacheca Trofei' }} 
        />
        <Stack.Screen 
          name="Statistiche" 
          component={StatsScreen} 
          options={{ title: 'Livello Ki' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- FOGLIO DI STILE COMPLETO ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qteOverlay: {
    position: 'absolute',
    top: 25,
    zIndex: 99,
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    alignItems: 'center',
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fef08a',
  },
  qteTitolo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  qteTempo: {
    color: '#fef08a',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qteBottone: {
    backgroundColor: '#fef08a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  qteTestoBottone: {
    color: '#991b1b',
    fontWeight: '900',
    fontSize: 13,
  },
  caricaKiBox: {
    alignItems: 'center',
    marginBottom: 14,
    width: 220,
  },
  testoCarica: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#374151',
  },
  barraSfondo: {
    width: '100%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barraRiempita: {
    height: '100%',
    backgroundColor: '#f59e0b',
  },
  bannerSaiyan: {
    backgroundColor: '#fbbf24',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 14,
    elevation: 6,
  },
  testoBannerSaiyan: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
  },
  fumettoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  fumetto: {
    backgroundColor: '#1f2937',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    maxWidth: 280,
  },
  fumettoSaiyan: {
    backgroundColor: '#fbbf24',
  },
  testoFumetto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  testoFumettoSaiyan: {
    color: '#000000',
    fontWeight: 'bold',
  },
  frecciaFumetto: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1f2937',
  },
  frecciaFumettoSaiyan: {
    borderTopColor: '#fbbf24',
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  auraSaiyan: {
    position: 'absolute',
    width: 175,
    height: 175,
    borderRadius: 88,
    backgroundColor: '#fbbf24',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#e63946',
  },
  avatarSaiyan: {
    borderColor: '#fbbf24',
    borderWidth: 5,
  },
  cuore: {
    position: 'absolute',
    fontSize: 32,
    bottom: 50,
  },
  titolo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sottotitolo: {
    fontSize: 14,
    marginBottom: 14,
  },
  bottoneCustom: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 30,
    elevation: 4,
    marginBottom: 12,
  },
  bottoneSaiyan: {
    backgroundColor: '#fbbf24',
    transform: [{ scale: 1.05 }],
  },
  testoBottone: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  testoBottoneSaiyan: {
    color: '#000000',
  },
  rigaBottoni: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  bottoneNavigazione: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
  },
  bottoneTrofei: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
  },
  testoNavigazione: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bottoneReset: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  testoReset: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  trofeiContainer: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    flexGrow: 1,
  },
  trofeiTitolo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  trofeiSottotitolo: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 18,
  },
  trofeoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  trofeoSbloccatoCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
  },
  trofeoBloccatoCard: {
    backgroundColor: '#e5e7eb',
    opacity: 0.65,
  },
  trofeoIcona: {
    fontSize: 28,
    marginRight: 12,
  },
  trofeoDettagli: {
    flex: 1,
  },
  trofeoNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  trofeoNomeSbloccato: {
    color: '#111827',
  },
  trofeoDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  trofeoStato: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginLeft: 8,
  },
  trofeoStatoSbloccato: {
    color: '#10b981',
  },
  statsContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitolo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  cardStat: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  labelStat: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  valoreStat: {
    fontSize: 15,
    color: '#111827',
    fontWeight: 'bold',
  },
  bottoneRitorno: {
    marginTop: 20,
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  testoRitorno: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});