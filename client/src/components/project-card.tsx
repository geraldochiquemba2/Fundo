import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProjectCardProps {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  totalInvested: string;
  displayInvestment?: {
    id: number;
    projectId: number;
    displayAmount: string;
    updatedAt: string;
  };
  sdg?: {
    id: number;
    number: number;
    name: string;
    color: string;
  };
}

const ProjectCard = ({ id, name, description, imageUrl, totalInvested, displayInvestment, sdg }: ProjectCardProps) => {
  // Função para determinar o valor a ser exibido (displayAmount ou totalInvested)
  const getDisplayValue = () => {
    // Se displayInvestment existe E tem uma propriedade displayAmount que não é nula/indefinida
    if (displayInvestment && displayInvestment.displayAmount !== undefined && displayInvestment.displayAmount !== null) {
      return displayInvestment.displayAmount;
    }
    
    // Se chegamos aqui, usamos o totalInvested como fallback
    return totalInvested;
  };
  // Format currency - showing only actual values
  const formatCurrency = (value: string | number | undefined | null) => {
    // No value provided or zero value
    if (value === undefined || value === null) {
      return "0 Kz";
    }
    
    // Convert to a number for proper formatting
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    // If the value is invalid or zero, show zero
    if (isNaN(num)) {
      return "0 Kz";
    }
    
    // Use locale formatting - display actual value always
    return new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " Kz";
  };
  
  // Convert hex color to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Get text color based on background color
  const getBadgeTextColor = (bgColor: string) => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return "text-white";
    
    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? "text-gray-800" : "text-white";
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            console.log('Failed to load image:', imageUrl);
            // Try different extensions or fallback
            if (imageUrl.includes('.svg')) {
              const baseUrl = imageUrl.replace('.svg', '');
              img.src = baseUrl + '.jpg';
            } else if (imageUrl.includes('.jpg')) {
              const baseUrl = imageUrl.replace('.jpg', '');
              img.src = baseUrl + '.svg';
            } else {
              // Final fallback to a solid color background
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent) {
                parent.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
                parent.innerHTML = `<div class="flex items-center justify-center h-full text-white font-semibold">${name}</div>`;
              }
            }
          }}
        />
      </div>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center mb-4">
          {sdg && (
            <>
              <Badge 
                style={{ backgroundColor: sdg.color || '#22c55e' }}
                className={`mr-2 ${getBadgeTextColor(sdg.color || '#22c55e')}`}
              >
                ODS {sdg.number || 'N/A'}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{sdg.name || 'ODS'}</span>
                <span className="text-sm font-bold text-[#e6f0ea]">
                  {formatCurrency(getDisplayValue())}
                </span>
              </div>
            </>
          )}
        </div>
        <h3 className="font-semibold text-xl mb-2 line-clamp-1">{name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-[#ebedf2]">Valor investido</p>
            <p className="font-bold text-[#fffcfc]">
              {formatCurrency(getDisplayValue())}
            </p>
          </div>
          <Link href={`/projeto/${id}`} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-primary text-primary hover:bg-primary-50">
            Ver Detalhes
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
