import { cn } from "@/lib/utils";

interface OdsIconProps {
  number: number;
  name: string;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const OdsIcon = ({ number, name, color, className, onClick }: OdsIconProps) => {
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
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center p-3 rounded-lg hover:shadow-md transition-shadow cursor-pointer",
        className
      )}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      <div 
        className="w-16 h-16 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: actualColor }}
      >
        <span className="text-white font-bold">{number}</span>
      </div>
      <span className="mt-2 text-center text-sm font-medium">{name}</span>
    </div>
  );
};

export default OdsIcon;
