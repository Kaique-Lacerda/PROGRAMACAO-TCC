import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useWeather = () => {
  const [clima, setClima] = useState({ temperatura: '--', icone: '--' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getLocationAndFetchClima() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permissão de localização negada!');
          setLoading(false);
          return;
        }
        
        let location = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Highest 
        });
        
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
          else if (status === 'Thunderstorm') icone = '⛈️ Tempestade';
          else if (status === 'Snow') icone = '❄️ Neve';
          else if (status === 'Mist' || status === 'Fog') icone = '🌫️ Neblina';
          else icone = `${status}`;
          
          setClima({
            temperatura: `${Math.round(data.main.temp)}°C`,
            icone: icone
          });
        }
      } catch (e) {
        console.log('❌', 'CLIMA', 'Erro ao buscar clima:', e);
        setClima({ temperatura: '--', icone: '--' });
      } finally {
        setLoading(false);
      }
    }

    getLocationAndFetchClima();
  }, []);

  return {
    clima,
    loading
  };
};