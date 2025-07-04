import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Carregando plataforma...");

  useEffect(() => {
    const messages = [
      "Carregando plataforma...",
      "Otimizando para seu dispositivo...",
      "Carregando projetos sustentáveis...",
      "Preparando dados dos ODS...",
      "Quase pronto..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 25;
        
        if (currentStep < messages.length - 1) {
          setMessage(messages[currentStep + 1]);
          currentStep++;
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 100);
          return 100;
        }
        
        return newProgress;
      });
    }, 150); // Even faster animation

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center z-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Logo/Icon */}
        <div className="w-20 h-20 mx-auto bg-green-600 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plataforma de Sustentabilidade</h1>
          <p className="text-gray-600">{message}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-sm mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-500">{progress}%</div>
        </div>
        
        {/* Features */}
        <div className="text-left space-y-2 max-w-xs mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${progress >= 20 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Projetos Ambientais</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${progress >= 40 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Objetivos de Desenvolvimento Sustentável</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${progress >= 60 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Calculadora de Carbono</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${progress >= 80 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Dashboard Empresarial</span>
          </div>
        </div>
      </div>
    </div>
  );
}