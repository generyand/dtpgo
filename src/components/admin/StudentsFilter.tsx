'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

export interface FilterParams {
  program?: string;
  year?: string;
  registrationSource?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface StudentsFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: FilterParams) => void;
  initialFilters?: FilterParams;
}

interface Program {
  id: string;
  name: string;
  displayName: string;
}

export function StudentsFilter({ 
  isOpen, 
  onClose, 
  onFilterChange, 
  initialFilters = {} 
}: StudentsFilterProps) {
  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Fetch programs on component mount
  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/admin/programs');
        if (response.ok) {
          const data = await response.json();
          setPrograms(data);
        }
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      }
    }
    fetchPrograms();
  }, []);

  const handleFilterChange = (key: keyof FilterParams, value: string | undefined) => {
    // Convert "all" back to undefined for cleaner filter state
    const actualValue = value === 'all' ? undefined : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Remove empty values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value && value.trim() !== '')
    );
    onFilterChange(cleanFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value.trim() !== '');

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border bg-white p-6 shadow-lg dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Filter Students
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Program Filter */}
        <div className="space-y-2">
          <Label htmlFor="program-filter">Program</Label>
          <Select
            value={filters.program || 'all'}
            onValueChange={(value) => handleFilterChange('program', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All programs</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  <span className="block sm:hidden">{program.name}</span>
                  <span className="hidden sm:block">{program.name} - {program.displayName}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="space-y-2">
          <Label htmlFor="year-filter">Academic Year</Label>
          <Select
            value={filters.year || 'all'}
            onValueChange={(value) => handleFilterChange('year', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
              <SelectItem value="5">5th Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Registration Source Filter */}
        <div className="space-y-2">
          <Label htmlFor="source-filter">Registration Source</Label>
          <Select
            value={filters.registrationSource || 'all'}
            onValueChange={(value) => handleFilterChange('registrationSource', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="admin">Admin Registration</SelectItem>
              <SelectItem value="public">Public Registration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From Filter */}
        <div className="space-y-2">
          <Label htmlFor="date-from-filter">Registration Date From</Label>
          <Input
            id="date-from-filter"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Date To Filter */}
        <div className="space-y-2">
          <Label htmlFor="date-to-filter">Registration Date To</Label>
          <Input
            id="date-to-filter"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {hasActiveFilters ? 'Filters active' : 'No filters applied'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StudentsFilter;
