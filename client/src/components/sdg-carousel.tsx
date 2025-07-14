import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";

interface SDGCarouselProps {
  autoplay?: boolean;
  interval?: number;
}

const SDGCarousel = ({ autoplay = true, interval = 5000 }: SDGCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<any>(null);

  // Fetch SDGs data for the carousel
  const { data: sdgs } = useQuery({
    queryKey: ['/api/sdgs'],
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // SDG images mapping with consistent dimensions
  const sdgImages = [
    {
      id: 1,
      name: "Erradicação da Pobreza",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Erradicação da Pobreza"
    },
    {
      id: 2,
      name: "Fome Zero e Agricultura Sustentável",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Fome Zero e Agricultura Sustentável"
    },
    {
      id: 3,
      name: "Saúde e Bem-Estar",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Saúde e Bem-Estar"
    },
    {
      id: 4,
      name: "Educação de Qualidade",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Educação de Qualidade"
    },
    {
      id: 5,
      name: "Igualdade de Gênero",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Igualdade de Gênero"
    },
    {
      id: 6,
      name: "Água Potável e Saneamento",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Água Potável e Saneamento"
    },
    {
      id: 7,
      name: "Energia Limpa e Acessível",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Energia Limpa e Acessível"
    },
    {
      id: 8,
      name: "Trabalho Decente e Crescimento Econômico",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Trabalho Decente e Crescimento Econômico"
    },
    {
      id: 9,
      name: "Indústria, Inovação e Infraestrutura",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Indústria, Inovação e Infraestrutura"
    },
    {
      id: 10,
      name: "Redução das Desigualdades",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Redução das Desigualdades"
    },
    {
      id: 11,
      name: "Cidades e Comunidades Sustentáveis",
      image: "https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Cidades e Comunidades Sustentáveis"
    },
    {
      id: 12,
      name: "Consumo e Produção Responsáveis",
      image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Consumo e Produção Responsáveis"
    },
    {
      id: 13,
      name: "Ação Contra a Mudança Global do Clima",
      image: "https://images.unsplash.com/photo-1561485132-59468cd0b553?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Ação Contra a Mudança Global do Clima"
    },
    {
      id: 14,
      name: "Vida na Água",
      image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Vida na Água"
    },
    {
      id: 15,
      name: "Vida Terrestre",
      image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Vida Terrestre"
    },
    {
      id: 16,
      name: "Paz, Justiça e Instituições Eficazes",
      image: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Paz, Justiça e Instituições Eficazes"
    },
    {
      id: 17,
      name: "Parcerias e Meios de Implementação",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
      alt: "Parcerias e Meios de Implementação"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!autoplay || !api) return;

    const timer = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, api]);

  // Listen for slide changes
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden">
      <Carousel 
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="h-full">
          {sdgImages.map((sdg, index) => (
            <CarouselItem key={sdg.id} className="h-full">
              <div className="relative w-full h-80 min-h-80 max-h-80 overflow-hidden">
                <img
                  src={sdg.image}
                  alt={sdg.alt}
                  className="w-full h-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {/* Overlay with SDG information */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="font-bold text-xl mb-2">
                      ODS {sdg.id}
                    </h3>
                    <p className="text-lg font-medium">
                      {sdg.name}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation buttons */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black border-0 shadow-lg" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black border-0 shadow-lg" />
        
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {sdgImages.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default SDGCarousel;