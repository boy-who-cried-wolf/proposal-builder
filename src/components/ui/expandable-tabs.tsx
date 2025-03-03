
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface Tab {
  title: string;
  icon: React.ComponentType<any>;
  content?: React.ReactNode;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  content?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  activeTab?: number | null; // Updated to match ProposalHeaderTabs
  onTabChange?: (index: number | null) => void;
  showTabContent?: boolean;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  activeTab = null, // Updated to match ProposalHeaderTabs
  onTabChange,
  showTabContent = false,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(activeTab);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef(null);

  // Update selected state when activeTab prop changes
  React.useEffect(() => {
    setSelected(activeTab);
  }, [activeTab]);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
    onTabChange?.(null);
  });

  const handleSelect = (index: number) => {
    setSelected(index);
    onTabChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div className="flex flex-col">
      <div
        ref={outsideClickRef}
        className={cn(
          "flex flex-wrap items-center gap-2 bg-background p-1",
          className
        )}
      >
        {tabs.map((tab, index) => {
          if (tab.type === "separator") {
            return <Separator key={`separator-${index}`} />;
          }

          const TabIcon = (tab as Tab).icon as LucideIcon;
          const isExpanded = selected === index || hovered === index;
          
          return (
            <motion.button
              key={(tab as Tab).title}
              variants={buttonVariants}
              initial={false}
              animate="animate"
              custom={isExpanded}
              onClick={() => handleSelect(index)}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              transition={transition}
              className={cn(
                "relative flex items-center px-4 py-2 text-sm font-medium transition-colors duration-300 whitespace-nowrap",
                isExpanded
                  ? cn("bg-muted", activeColor)
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <TabIcon size={20} />
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.span
                    variants={spanVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={transition}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {(tab as Tab).title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      
      {showTabContent && selected !== null && (
        <div className="mt-4 p-4 bg-muted/20 rounded-lg">
          {tabs[selected] && !(tabs[selected] as any).type && (tabs[selected] as Tab).content}
        </div>
      )}
    </div>
  );
}
