import React, { useState, useEffect } from 'react';

interface DebugImageProps {
  src: string;
  alt: string;
  className?: string;
}

const DebugImage = ({ src, alt, className }: DebugImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState<string[]>([]);
  
  // URLs a tentar
  const getUrls = () => {
    const urls = [
      src,
      src.startsWith('/') ? src.substring(1) : `/${src}`,
    ];
    
    // Se já tiver "/uploads/logos/" no caminho, também tentar sem isso
    if (src.includes('/uploads/logos/')) {
      const filename = src.split('/').pop();
      urls.push(`/uploads/logos/${filename}`);
      urls.push(`${filename}`);
    } else {
      // Se não tiver, tentar com esse prefixo
      urls.push(`/uploads/logos/${src}`);
    }
    
    return urls;
  };
  
  useEffect(() => {
    const urls = getUrls();
    console.log("URLs a tentar:", urls);
    setAttempts(urls);
  }, [src]);
  
  return (
    <div className="debug-image-container">
      <div className="original-image">
        <img 
          src={src} 
          alt={alt} 
          className={className}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
        <div className="status">
          {loaded ? "✅ Imagem carregada com sucesso" : 
            error ? "❌ Erro ao carregar imagem" : 
            "⏳ Carregando..."}
        </div>
      </div>
      
      <div className="debug-info">
        <p>Tentando carregar: <strong>{src}</strong></p>
        <div className="attempts">
          {attempts.map((url, index) => (
            <div key={index} className="attempt">
              <img 
                src={url} 
                alt={`Tentativa ${index + 1}`} 
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                onLoad={() => console.log(`Tentativa ${index + 1} carregada: ${url}`)}
                onError={() => console.log(`Tentativa ${index + 1} falhou: ${url}`)}
              />
              <span>URL {index + 1}: {url}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugImage;