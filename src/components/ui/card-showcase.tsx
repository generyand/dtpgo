'use client';

import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  CardAction,
  CardGroup,
  CardSection
} from '@/components/ui/card';
import { 
  Separator, 
  EnhancedSeparator, 
  ContentSeparator, 
  SectionSeparator 
} from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Clock, 
  Settings, 
  Star,
  TrendingUp
} from 'lucide-react';

// Card showcase component for development/testing
export function CardShowcase() {

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Enhanced Card & Separator System</h2>
        
        <div className="space-y-8">
          {/* Basic Card Variants */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Basic Card Variants</h3>
            <CardGroup gap="md" columns={2}>
              <Card variant="default" size="md">
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>Standard card with border and shadow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is the default card variant with a subtle border and shadow.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" size="md">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>Card with enhanced shadow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card has a stronger shadow for more prominence.
                  </p>
                </CardContent>
              </Card>

              <Card variant="outlined" size="md">
                <CardHeader>
                  <CardTitle>Outlined Card</CardTitle>
                  <CardDescription>Card with thick border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card uses a thick border instead of shadows.
                  </p>
                </CardContent>
              </Card>

              <Card variant="ghost" size="md">
                <CardHeader>
                  <CardTitle>Ghost Card</CardTitle>
                  <CardDescription>Minimal card without borders</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card has no borders or shadows for a clean look.
                  </p>
                </CardContent>
              </Card>
            </CardGroup>
          </section>

          {/* Card Sizes */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Card Sizes</h3>
            <CardGroup gap="md" columns={4}>
              <Card variant="default" size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Small</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Compact size</p>
                </CardContent>
              </Card>

              <Card variant="default" size="md">
                <CardHeader>
                  <CardTitle>Medium</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Standard size</p>
                </CardContent>
              </Card>

              <Card variant="default" size="lg">
                <CardHeader>
                  <CardTitle className="text-lg">Large</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Spacious size</p>
                </CardContent>
              </Card>

              <Card variant="default" size="xl">
                <CardHeader>
                  <CardTitle className="text-xl">Extra Large</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Maximum size</p>
                </CardContent>
              </Card>
            </CardGroup>
          </section>

          {/* Interactive Cards */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Interactive Cards</h3>
            <CardGroup gap="md" columns={2}>
              <Card variant="default" size="md" interactive hoverable>
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>Clickable with hover effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card has hover effects and cursor pointer.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Click Me</Button>
                </CardFooter>
              </Card>

              <Card variant="elevated" size="md" interactive hoverable>
                <CardHeader>
                  <CardTitle>Hoverable Card</CardTitle>
                  <CardDescription>Elevates on hover</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card lifts up slightly when hovered.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">Hover Me</Button>
                </CardFooter>
              </Card>
            </CardGroup>
          </section>

          {/* Card with Actions */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Card with Actions</h3>
            <Card variant="default" size="md">
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>Manage your events and sessions</CardDescription>
                <CardAction>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Next Event: Tomorrow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Participants: 45</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Duration: 2 hours</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter justify="between">
                <Badge variant="secondary">Active</Badge>
                <div className="flex gap-2">
                  <Button size="sm">Edit</Button>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </CardFooter>
            </Card>
          </section>

          {/* Separator Variants */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Separator Variants</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Basic Separators</h4>
                <div className="space-y-4">
                  <Separator />
                  <Separator orientation="vertical" className="h-8" />
                  <EnhancedSeparator variant="muted" size="lg" />
                  <EnhancedSeparator variant="dashed" size="md" />
                  <EnhancedSeparator variant="dotted" size="sm" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Content Separators</h4>
                <div className="space-y-4">
                  <ContentSeparator text="OR" variant="default" size="md" />
                  <ContentSeparator text="Continue with" variant="muted" size="sm" />
                  <ContentSeparator text="Section Break" variant="strong" size="lg" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Section Separators</h4>
                <div className="space-y-4">
                  <SectionSeparator 
                    title="New Section" 
                    description="This begins a new content area"
                    variant="default"
                    size="md"
                  />
                  <SectionSeparator 
                    title="Important Notice" 
                    variant="strong"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card Sections */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Card Sections</h3>
            <Card variant="default" size="lg">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Comprehensive event information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardSection 
                  title="Basic Information"
                  description="Core event details"
                  bordered
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Event Name</label>
                      <p className="text-sm">Annual Conference 2024</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Date</label>
                      <p className="text-sm">December 15, 2024</p>
                    </div>
                  </div>
                </CardSection>

                <Separator />

                <CardSection 
                  title="Advanced Settings"
                  description="Optional configurations"
                  bordered
                  collapsible
                  defaultCollapsed={true}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-registration</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Waitlist</span>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                  </div>
                </CardSection>

                <Separator />

                <CardSection 
                  title="Statistics"
                  description="Event performance metrics"
                  bordered
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">156</div>
                      <div className="text-xs text-muted-foreground">Registrations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">89%</div>
                      <div className="text-xs text-muted-foreground">Attendance Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">4.8</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>
                </CardSection>
              </CardContent>
              <CardFooter justify="end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </section>

          {/* Complex Layout Example */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Complex Layout Example</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Card variant="outlined" size="sm">
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">+12% this week</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">4.9 rating</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="ghost" size="sm">
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>• New session created</p>
                      <p>• 5 organizers assigned</p>
                      <p>• Event published</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center Column */}
              <div className="lg:col-span-2">
                <Card variant="default" size="md">
                  <CardHeader>
                    <CardTitle>Event Dashboard</CardTitle>
                    <CardDescription>Overview of all your events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Upcoming Events</h4>
                          <p className="text-sm text-muted-foreground">3 events this month</p>
                        </div>
                        <Button size="sm">View All</Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm">Active Sessions</h5>
                          <p className="text-2xl font-bold text-primary">12</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm">Total Organizers</h5>
                          <p className="text-2xl font-bold text-blue-600">8</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter justify="between">
                    <Button variant="outline">Export Data</Button>
                    <Button>Create New Event</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
