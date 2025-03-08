
import React, { createContext, useContext, useState, useEffect } from "react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const CheckboxGroupContext = createContext<{
  value: string[];
  onChange: (value: string[]) => void;
}>({
  value: [],
  onChange: () => {},
});

export function CheckboxGroup({
  value = [],
  onValueChange,
  children,
  className,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [selectedValues, setSelectedValues] = useState<string[]>(value);

  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const handleValueChange = (itemValue: string, checked: boolean) => {
    const newSelectedValues = checked
      ? [...selectedValues, itemValue]
      : selectedValues.filter((v) => v !== itemValue);
    
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  };

  return (
    <CheckboxGroupContext.Provider
      value={{
        value: selectedValues,
        onChange: handleValueChange,
      }}
    >
      <div className={className}>{children}</div>
    </CheckboxGroupContext.Provider>
  );
}

export function CheckboxItem({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: string;
}) {
  const { value: selectedValues, onChange } = useContext(CheckboxGroupContext);
  const isChecked = selectedValues.includes(value);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={isChecked}
        onCheckedChange={(checked) => onChange(value, checked as boolean)}
      />
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
    </div>
  );
}
