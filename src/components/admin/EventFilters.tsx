'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EventFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'upcoming' | 'ended';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customDateFrom?: string;
  customDateTo?: string;
  sortBy: 'name' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
  totalResults: number;
  className?: string;
}

export function EventFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults,
  className,
}: EventFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onFiltersChange]);

  // Handle filter changes
  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Handle date range change
  const handleDateRangeChange = (range: EventFilters['dateRange']) => {
    if (range === 'custom') {
      onFiltersChange({ ...filters, dateRange: range });
    } else {
      onFiltersChange({ 
        ...filters, 
        dateRange: range,
        customDateFrom: undefined,
        customDateTo: undefined
      });
    }
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') count++;
    return count;
  };

  // Clear all filters
  const handleClearFilters = () => {
    setLocalSearch('');
    onClearFilters();
  };

  // Get status display name
  const getStatusDisplayName = (status: EventFilters['status']) => {
    switch (status) {
      case 'active': return 'Active Now';
      case 'inactive': return 'Inactive';
      case 'upcoming': return 'Upcoming';
      case 'ended': return 'Ended';
      default: return 'All Status';
    }
  };

  // Get date range display name
  const getDateRangeDisplayName = (range: EventFilters['dateRange']) => {
    switch (range) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'custom': return 'Custom Range';
      default: return 'All Dates';
    }
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events by name, description, or location..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <Select value={filters.status} onValueChange={(value: EventFilters['status']) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Now</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="border rounded-lg p-4 bg-gray-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Advanced Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">From Date</label>
                  <Input
                    type="date"
                    value={filters.customDateFrom || ''}
                    onChange={(e) => handleFilterChange('customDateFrom', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">To Date</label>
                  <Input
                    type="date"
                    value={filters.customDateTo || ''}
                    onChange={(e) => handleFilterChange('customDateTo', e.target.value)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value: EventFilters['sortBy']) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="endDate">End Date</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort Order</label>
              <Select 
                value={filters.sortOrder} 
                onValueChange={(value: EventFilters['sortOrder']) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {filters.search && (
                <Badge variant="outline" className="text-xs">
                  Search: "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('search', '')}
                    className="h-4 w-4 p-0 ml-1 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.status !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Status: {getStatusDisplayName(filters.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('status', 'all')}
                    className="h-4 w-4 p-0 ml-1 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.dateRange !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Date: {getDateRangeDisplayName(filters.dateRange)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateRangeChange('all')}
                    className="h-4 w-4 p-0 ml-1 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Summary and Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {totalResults === 0 ? (
            'No events found'
          ) : (
            <>
              Showing <span className="font-medium">{totalResults}</span> event{totalResults === 1 ? '' : 's'}
              {activeFiltersCount > 0 && (
                <span className="text-gray-500 ml-2">
                  (filtered from all events)
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
