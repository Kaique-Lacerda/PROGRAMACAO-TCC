import { useState, useEffect } from 'react';

export const useTime = (clima) => {
  const [hora, setHora] = useState('');
  const [cenarioAtual, setCenarioAtual] = useState('dia_ensolarado');

  const determinarCenarioCompleto = (horaAtual, climaAtual) => {
    const horaNum = parseInt(horaAtual.split(':')[0]);
    const condicaoClima = climaAtual.icone.toLowerCase();
    
    let periodo = 'dia';
    if (horaNum >= 5 && horaNum < 12) periodo = 'manha';
    else if (horaNum >= 12 && horaNum < 17) periodo = 'tarde';
    else if (horaNum >= 17 && horaNum < 20) periodo = 'entardecer';
    else periodo = 'noite';
    
    let condicao = 'ensolarado';
    if (condicaoClima.includes('chuva') || condicaoClima.includes('rain') || condicaoClima.includes('drizzle')) {
      condicao = 'chuvoso';
    } else if (condicaoClima.includes('nublado') || condicaoClima.includes('cloud')) {
      condicao = 'nublado';
    } else if (condicaoClima.includes('tempestade') || condicaoClima.includes('thunderstorm')) {
      condicao = 'tempestade';
    } else if (condicaoClima.includes('neve') || condicaoClima.includes('snow')) {
      condicao = 'nevando';
    } else if (condicaoClima.includes('neblina') || condicaoClima.includes('mist') || condicaoClima.includes('fog')) {
      condicao = 'neblina';
    }
    
    return `${periodo}_${condicao}`;
  };

  useEffect(() => {
    const updateHoraECenario = () => {
      const now = new Date();
      const horaFormatada = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      setHora(horaFormatada);
      
      const novoCenario = determinarCenarioCompleto(horaFormatada, clima);
      if (novoCenario !== cenarioAtual) {
        setCenarioAtual(novoCenario);
      }
    };

    updateHoraECenario();
    
    const timer = setInterval(updateHoraECenario, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [clima, cenarioAtual]);

  return {
    hora,
    cenarioAtual,
    determinarCenarioCompleto
  };
};