
import React, { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";

export type Option = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: Option[];
  value: Option[];
  onChange: (value: Option[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: Option) => {
    const isSelected = value.some((item) => item.value === option.value);
    
    if (isSelected) {
      onChange(value.filter((item) => item.value !== option.value));
    } else {
      onChange([...value, option]);
    }
  };

  const handleRemove = (option: Option) => {
    onChange(value.filter((item) => item.value !== option.value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex flex-wrap gap-1">
            {value.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {value.length > 0 && value.length <= 3 && (
              value.map((option) => (
                <Badge 
                  key={option.value} 
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {option.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(option);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(option);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
            {value.length > 3 && (
              <>
                <Badge variant="secondary" className="mr-1 mb-1">
                  {value[0].label}
                </Badge>
                <Badge variant="secondary" className="mr-1 mb-1">
                  +{value.length - 1} más
                </Badge>
              </>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = value.some((item) => item.value === option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option)}
                  className="flex items-center"
                >
                  <div 
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary" : "opacity-50"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
