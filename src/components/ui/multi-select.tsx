'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, ChevronDown, Users, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  maxDisplay?: number;
  error?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No options found.',
  disabled = false,
  className,
  maxDisplay = 3,
  error
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Get selected options
  const selectedOptions = options.filter(option => value.includes(option.value));

  // Handle option selection/deselection
  const handleOptionToggle = useCallback((optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  }, [value, onChange]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    const availableOptions = filteredOptions
      .filter(option => !option.disabled)
      .map(option => option.value);
    
    if (availableOptions.every(option => value.includes(option))) {
      // Deselect all filtered options
      const newValue = value.filter(v => !availableOptions.includes(v));
      onChange(newValue);
    } else {
      // Select all filtered options
      const newValue = [...new Set([...value, ...availableOptions])];
      onChange(newValue);
    }
  }, [filteredOptions, value, onChange]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          const option = filteredOptions[focusedIndex];
          if (!option.disabled) {
            handleOptionToggle(option.value);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [filteredOptions, focusedIndex, handleOptionToggle]);

  // Reset focus when opening
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
      setSearchValue('');
      // Focus search input after a short delay
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search input focus
  const handleSearchFocus = () => {
    setFocusedIndex(-1);
  };


  // Check if all filtered options are selected
  const allSelected = filteredOptions
    .filter(option => !option.disabled)
    .every(option => value.includes(option.value));


  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              'w-full justify-between',
              !value.length && 'text-muted-foreground',
              error && 'border-destructive focus:ring-destructive'
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Users className="h-4 w-4 shrink-0" />
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {value.length === 0 ? (
                  <span className="truncate">{placeholder}</span>
                ) : (
                  <>
                    {selectedOptions.slice(0, maxDisplay).map((option) => (
                      <Badge
                        key={option.value}
                        variant="secondary"
                        className="shrink-0"
                      >
                        {option.label}
                      </Badge>
                    ))}
                    {selectedOptions.length > maxDisplay && (
                      <Badge variant="secondary" className="shrink-0">
                        +{selectedOptions.length - maxDisplay} more
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command onKeyDown={handleKeyDown}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={searchValue}
                onValueChange={setSearchValue}
                onFocus={handleSearchFocus}
                className="border-0 focus:ring-0 px-0"
              />
            </div>
            
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {allSelected ? 'Deselect All' : 'Select All'}
                </span>
              </div>
              {value.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 px-2 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <CommandList className="max-h-[300px]">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option, index) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={() => handleOptionToggle(option.value)}
                    className={cn(
                      'flex items-center space-x-2 cursor-pointer',
                      focusedIndex === index && 'bg-accent',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Checkbox
                      checked={value.includes(option.value)}
                      disabled={option.disabled}
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            
            {value.length > 0 && (
              <div className="border-t p-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Selected ({value.length}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="pr-1"
                    >
                      {option.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handleOptionToggle(option.value)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {error && (
        <div className="text-sm text-destructive mt-1">{error}</div>
      )}
    </div>
  );
}
