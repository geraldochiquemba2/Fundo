import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnboarding } from "@/hooks/use-onboarding";

export function HelpButton() {
  const { showOnboarding } = useOnboarding();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Ajuda</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={showOnboarding}>
          Assistente de introdução
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}