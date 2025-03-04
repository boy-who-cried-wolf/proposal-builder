
import React from "react";

interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  min = 1,
}) => {
  return (
    <div>
      <label className="text-black text-[11px] font-semibold tracking-[1px] uppercase block mb-2">
        {label}
      </label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1px] uppercase bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
      />
    </div>
  );
};
