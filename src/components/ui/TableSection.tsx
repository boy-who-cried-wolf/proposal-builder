
import React from "react";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";

interface TableItem {
  item: string;
  description: string;
  hours: string;
  price: string;
}

interface TableSectionProps {
  title: string;
  items: TableItem[];
  subtotal: string;
  className?: string;
}

export const TableSection: React.FC<TableSectionProps> = ({
  title,
  items,
  subtotal,
  className,
}) => {
  return (
    <div className={cn("section_wrapper mb-[34px]", className)}>
      <SectionHeader title={title} />

      {/* Table Header */}
      <div className="section_table_header grid grid-cols-[2fr_4fr_1fr_1fr] text-black text-[9px] font-semibold tracking-[1.389px] uppercase px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
          Item
        </div>
        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
          Description
        </div>
        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
          Hours
        </div>
        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
          Price
        </div>
      </div>

      {/* Table Rows */}
      {items.map((item, index) => (
        <div
          key={index}
          className="section_table_row grid grid-cols-[2fr_4fr_1fr_1fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]"
        >
          <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
            {item.item}
          </div>
          <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
            {item.description}
          </div>
          <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
            {item.hours}
          </div>
          <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
            {item.price}
          </div>
        </div>
      ))}

      {/* Table Footer */}
      <div className="section_table_footer grid grid-cols-[2fr_4fr_1fr_1fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
          Subtotal
        </div>
        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
          {subtotal}
        </div>
      </div>
    </div>
  );
};
