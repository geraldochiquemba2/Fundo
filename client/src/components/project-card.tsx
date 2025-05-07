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
  sdg: {
    id: number;
    number: number;
    name: string;
    color: string;
  };
}

const ProjectCard = ({ id, name, description, imageUrl, totalInvested, displayInvestment, sdg }: ProjectCardProps) => {
  // Format currency
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0 Kz";
    
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
      <div className="h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Badge 
            style={{ backgroundColor: sdg.color }}
            className={`mr-2 ${getBadgeTextColor(sdg.color)}`}
          >
            ODS {sdg.number}
          </Badge>
          <span className="text-sm text-gray-500">{sdg.name}</span>
        </div>
        <h3 className="font-semibold text-xl mb-2 line-clamp-1">{name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Valor investido</p>
            <p className="font-bold text-primary">
              {displayInvestment 
                ? formatCurrency(displayInvestment.displayAmount) 
                : formatCurrency(totalInvested)}
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
