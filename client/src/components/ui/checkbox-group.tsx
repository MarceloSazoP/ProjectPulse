
import * as React from "react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

interface CheckboxGroupProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  className?: string;
  children: React.ReactNode;
}

export const CheckboxGroup = ({
  value,
  onValueChange,
  className,
  children,
}: CheckboxGroupProps) => {
  return <div className={className}>{children}</div>;
};

interface CheckboxItemProps {
  id: string;
  label: string;
  value: string;
}

export const CheckboxItem = ({ id, label, value }: CheckboxItemProps) => {
  const [checkboxGroupValue, setCheckboxGroupValue] = React.useState<string[]>([]);

  // Find the CheckboxGroup component
  const checkboxGroupContext = React.useContext(
    React.createContext<{
      value: string[];
      onValueChange: (value: string[]) => void;
    }>({
      value: checkboxGroupValue,
      onValueChange: setCheckboxGroupValue,
    })
  );

  const handleChange = (checked: boolean) => {
    if (checked) {
      checkboxGroupContext.onValueChange([
        ...checkboxGroupContext.value,
        value,
      ]);
    } else {
      checkboxGroupContext.onValueChange(
        checkboxGroupContext.value.filter((v) => v !== value)
      );
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checkboxGroupContext.value.includes(value)}
        onCheckedChange={handleChange}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
};
