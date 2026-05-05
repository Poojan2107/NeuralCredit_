import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label: string;
  name: string;
  value: string;
  icon: React.ElementType;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function CustomSelect({ label, name, value, icon: Icon, options, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    // Mock an event object for the parent onChange handler
    const mockEvent = {
      target: { name, value: optionValue }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(mockEvent);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label || value;

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={containerRef}>
      <div className="flex items-center gap-2 mb-1 text-slate-300 text-sm font-medium">
        <Icon className="h-4 w-4 text-indigo-400" />
        {label}
      </div>
      
      <div 
        className={`w-full bg-black/20 border ${isOpen ? 'border-indigo-500' : 'border-white/5'} hover:border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-slate-200 text-sm font-mono">{selectedLabel}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-[105%] left-0 w-full z-50 bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden transform origin-top"
          >
            <div className="py-1 flex flex-col">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-3 text-sm font-mono cursor-pointer transition-colors ${
                    value === option.value 
                      ? 'bg-indigo-500/20 text-indigo-300 font-semibold' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
