import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventsList } from './EventsList';
import { EventWithDetails } from '@/lib/types/event';

// Mock the EventStatusBadge component
jest.mock('./EventStatusBadge', () => ({
  EventStatusBadge: ({ isActive, sessionCount, organizerCount }: { isActive: boolean; sessionCount: number; organizerCount: number }) => (
    <div data-testid="event-status-badge">
      Status: {isActive ? 'Active' : 'Inactive'} | Sessions: {sessionCount} | Organizers: {organizerCount}
    </div>
  ),
}));

// Mock event data
const mockEvent: EventWithDetails = {
  id: '1',
  name: 'Test Event',
  description: 'A test event description',
  startDate: new Date('2024-01-01T09:00:00Z'),
  endDate: new Date('2024-01-01T17:00:00Z'),
  location: 'Test Location',
  isActive: true,
  createdBy: 'admin-1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  sessions: [],
  organizerAssignments: [],
  _count: {
    sessions: 3,
    organizerAssignments: 2,
    attendance: 0,
  },
};

const mockEvents = [mockEvent];

const defaultProps = {
  events: mockEvents,
  selectedEventId: null,
  onEventSelect: jest.fn(),
  onViewDetails: jest.fn(),
  onEditEvent: jest.fn(),
  onDeleteEvent: jest.fn(),
  loading: false,
};

describe('EventsList', () => {
  it('renders events list correctly', () => {
    render(<EventsList {...defaultProps} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('A test event description')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByTestId('event-status-badge')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    render(<EventsList {...defaultProps} loading={true} />);
    
    // Should show skeleton loaders
    expect(screen.getAllByText('').length).toBeGreaterThan(0);
  });

  it('shows empty state when no events', () => {
    render(<EventsList {...defaultProps} events={[]} />);
    
    expect(screen.getByText('No events found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first event.')).toBeInTheDocument();
  });

  it('calls onEventSelect when event card is clicked', () => {
    const onEventSelect = jest.fn();
    render(<EventsList {...defaultProps} onEventSelect={onEventSelect} />);
    
    fireEvent.click(screen.getByText('Test Event').closest('.cursor-pointer')!);
    
    expect(onEventSelect).toHaveBeenCalledWith(mockEvent);
  });

  it('calls onViewDetails when view button is clicked', () => {
    const onViewDetails = jest.fn();
    render(<EventsList {...defaultProps} onViewDetails={onViewDetails} />);
    
    const viewButton = screen.getByRole('button', { name: /view/i });
    fireEvent.click(viewButton);
    
    expect(onViewDetails).toHaveBeenCalledWith(mockEvent);
  });

  it('prevents event selection when action button is clicked', () => {
    const onEventSelect = jest.fn();
    const onViewDetails = jest.fn();
    render(<EventsList {...defaultProps} onEventSelect={onEventSelect} onViewDetails={onViewDetails} />);
    
    const viewButton = screen.getByRole('button', { name: /view/i });
    fireEvent.click(viewButton);
    
    // onEventSelect should not be called when clicking action buttons
    expect(onEventSelect).not.toHaveBeenCalled();
    expect(onViewDetails).toHaveBeenCalledWith(mockEvent);
  });

  it('applies selected state styling when event is selected', () => {
    render(<EventsList {...defaultProps} selectedEventId="1" />);
    
    const selectedCard = screen.getByText('Test Event').closest('.cursor-pointer');
    expect(selectedCard).toHaveClass('border-blue-500', 'bg-blue-50/50');
  });
});
