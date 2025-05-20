import { cn } from "@/lib/utils";

interface OdsIconProps {
  number: number;
  name: string;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const OdsIcon = ({ number, name, color, className, onClick }: OdsIconProps) => {
  const getSDGImage = (num: number) => {
    const images = {
      1: "https://th.bing.com/th/id/R.e450166479d03cfb325dd75b19af094e?rik=idy70PFGT0R9Ig&pid=ImgRaw&r=0",
      2: "https://th.bing.com/th/id/OIP.oaFy_ZF8rMobDNAQefPEMwHaHa?rs=1&pid=ImgDetMain",
      3: "https://th.bing.com/th/id/OIP.y4kQwPfXldkP0Sl_vas4YgHaHa?w=1024&h=1024&rs=1&pid=ImgDetMain",
      4: "https://www.atlasodsamazonas.ufam.edu.br/images/SDG-icon-PT-04.jpg",
      5: "https://th.bing.com/th/id/R.da468d5af7524497df187803fe0cae70?rik=5bkwuaNWDZB0xw&riu=http%3a%2f%2fwww.fiepr.org.br%2fnospodemosparana%2fdbimages%2f165839.img&ehk=Pz8eF2%2fpyco9Vo%2f2nhqn1LePL%2bA9E5vlgHXfHjs3ZGc%3d&risl=&pid=ImgRaw&r=0",
      6: "https://www.researchgate.net/publication/332105058/figure/fig1/AS:742498821484544@1554036922168/Figura-2-Icone-do-ODS-6_Q320.jpg",
      7: "https://th.bing.com/th/id/R.82b241e50d1b45b63ffd8de1c3c533f5?rik=8IWQk1ZIRjAYMw&riu=http%3a%2f%2fwww4.planalto.gov.br%2fods%2fobjetivos-de-desenvolvimento-sustentavel%2f7-energia-acessivel-e-limpa%2f7.png&ehk=2Cx1gE6R73fSslp%2bhUHnrc2oDBXcnvzFiwq0ocxDfoE%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1",
      8: "https://th.bing.com/th/id/OIP.SfkeHcHVpu58f56QvSodSAAAAA?rs=1&pid=ImgDetMain",
      9: "https://th.bing.com/th/id/OIP.5n2ruG52gTFcl8z-2ulmpgHaHa?w=1772&h=1772&rs=1&pid=ImgDetMain",
      10: "https://ods.ine.gov.ao/img/team/ods10.png",
      11: "https://th.bing.com/th/id/OIP.TVr4hHLupfkGk14Md1GO_gHaHa?rs=1&pid=ImgDetMain",
      12: "https://www.terceiravia.org.br/wp-content/uploads/2020/11/ODS-12-2.png",
      13: "https://th.bing.com/th/id/OIP.JzbOWgHb5CgDVht4MUf37wHaHa?rs=1&pid=ImgDetMain",
      14: "https://th.bing.com/th/id/OIP.jdsJOCu9dLeAdGrpgeQ10wAAAA?w=466&h=466&rs=1&pid=ImgDetMain",
      15: "https://www.iberdrola.com/wcorp/gc/prod/es_ES/estaticos/ods-general/images/ico-ODS15-PT.png",
      16: "https://th.bing.com/th/id/OIP.vFknArfBQbEM6VaJOf3cIQHaHa?w=1024&h=1024&rs=1&pid=ImgDetMain",
      17: "https://th.bing.com/th/id/R.58589445ff5b3b737b0b7eabe2b4b601?rik=J1ybA5uwzTXDjg&riu=http%3a%2f%2fwww4.planalto.gov.br%2fods%2f17.png%2f%40%40images%2f35114d8b-1583-4660-90d4-1c6dca011b0f.png&ehk=GNtvTkjnrkn5JQa9CzZp7ejSfGCovMcO5WqMgQ9Ds8c%3d&risl=&pid=ImgRaw&r=0"
    };
    
    return images[num as keyof typeof images] || "";
  };

  const getDefaultColor = (num: number) => {
    const colors = {
      1: "#e5243b", // Vermelho - ODS 1 - Erradicação da Pobreza
      2: "#DDA63A", // Amarelo - ODS 2 - Fome Zero
      3: "#4C9F38", // Verde - ODS 3 - Saúde e Bem-estar
      4: "#C5192D", // Vermelho - ODS 4 - Educação de Qualidade
      5: "#FF3A21", // Laranja-avermelhado - ODS 5 - Igualdade de Gênero
      6: "#26BDE2", // Azul claro - ODS 6 - Água Potável e Saneamento
      7: "#FCC30B", // Amarelo - ODS 7 - Energia Limpa e Acessível
      8: "#A21942", // Vermelho escuro - ODS 8 - Trabalho Decente e Crescimento Econômico
      9: "#FD6925", // Laranja - ODS 9 - Indústria, Inovação e Infraestrutura
      10: "#DD1367", // Rosa - ODS 10 - Redução das Desigualdades
      11: "#FD9D24", // Laranja claro - ODS 11 - Cidades e Comunidades Sustentáveis
      12: "#BF8B2E", // Marrom claro - ODS 12 - Consumo e Produção Responsáveis
      13: "#3F7E44", // Verde escuro - ODS 13 - Ação Contra a Mudança Global do Clima
      14: "#0A97D9", // Azul médio - ODS 14 - Vida na Água
      15: "#56C02B", // Verde claro - ODS 15 - Vida Terrestre
      16: "#00689D", // Azul escuro - ODS 16 - Paz, Justiça e Instituições Eficazes
      17: "#19486A", // Azul marinho - ODS 17 - Parcerias e Meios de Implementação
    };
    
    return colors[num as keyof typeof colors] || "#CCCCCC";
  };
  
  const getBgColor = (num: number) => {
    const colors = {
      1: "#FAE5E7", // Fundo rosa claro
      2: "#FBF5DD", // Fundo amarelo claro
      3: "#E4F5E1", // Fundo verde claro
      4: "#F9E3E5", // Fundo rosa claro
      5: "#FEEAE6", // Fundo pêssego claro
      6: "#E7F6FB", // Fundo azul claro
      7: "#FEFBE3", // Fundo amarelo claro
      8: "#F7E4EA", // Fundo rosa claro
      9: "#FEF0E7", // Fundo pêssego claro
      10: "#FCE4EC", // Fundo rosa claro
      11: "#FEF2E4", // Fundo laranja muito claro
      12: "#F7F2E4", // Fundo bege claro
      13: "#E8F2E9", // Fundo verde muito claro
      14: "#E3F2FB", // Fundo azul claro
      15: "#ECF7E5", // Fundo verde claro
      16: "#E1EEF6", // Fundo azul claro
      17: "#E4ECF2", // Fundo azul acinzentado claro
    };
    
    return colors[num as keyof typeof colors] || "#F5F5F5";
  };
  
  const actualColor = color || getDefaultColor(number);
  const bgColor = getBgColor(number);
  const imageUrl = getSDGImage(number);
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center p-3 rounded-lg hover:shadow-md transition-shadow cursor-pointer",
        className
      )}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      {imageUrl ? (
        <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            src={imageUrl} 
            alt={`ODS ${number}`} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div 
          className="w-16 h-16 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: actualColor }}
        >
          <span className="text-white font-bold">{number}</span>
        </div>
      )}
      <span className="mt-2 text-center text-sm font-medium">{name}</span>
    </div>
  );
};

export default OdsIcon;
