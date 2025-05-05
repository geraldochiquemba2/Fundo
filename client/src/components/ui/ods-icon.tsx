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
      1: "bg-red-500",
      2: "bg-yellow-500",
      3: "bg-green-500",
      4: "bg-red-700",
      5: "bg-orange-600",
      6: "bg-blue-500",
      7: "bg-yellow-500",
      8: "bg-red-600",
      9: "bg-orange-500",
      10: "bg-pink-600",
      11: "bg-amber-500",
      12: "bg-amber-800",
      13: "bg-green-700",
      14: "bg-blue-600",
      15: "bg-green-600",
      16: "bg-blue-800",
      17: "bg-blue-900",
    };
    
    return colors[num as keyof typeof colors] || "bg-gray-500";
  };
  
  const getBgColor = (num: number) => {
    const colors = {
      1: "bg-red-100",
      2: "bg-yellow-100",
      3: "bg-green-100",
      4: "bg-red-100",
      5: "bg-orange-100",
      6: "bg-blue-100",
      7: "bg-yellow-100",
      8: "bg-red-100",
      9: "bg-orange-100",
      10: "bg-pink-100",
      11: "bg-amber-100",
      12: "bg-amber-100",
      13: "bg-green-100",
      14: "bg-blue-100",
      15: "bg-green-100",
      16: "bg-blue-100",
      17: "bg-blue-100",
    };
    
    return colors[num as keyof typeof colors] || "bg-gray-100";
  };
  
  const actualColor = color ? color : getDefaultColor(number);
  const bgColor = getBgColor(number);
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center p-3 rounded-lg hover:shadow-md transition-shadow cursor-pointer",
        bgColor,
        className
      )}
      onClick={onClick}
    >
      <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center", actualColor)}>
        <span className="text-white font-bold">{number}</span>
      </div>
      <span className="mt-2 text-center text-sm font-medium">{name}</span>
    </div>
  );
};

export default OdsIcon;
