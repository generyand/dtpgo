'use client';

import React from 'react';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  Activity,
  Shield,
  Eye,
  Accessibility
} from 'lucide-react';
import { 
  baseColors, 
  semanticColors, 
  getColor, 
  getColorWithOpacity 
} from '@/lib/styles/colors';
import { 
  statusColors, 
  getStatusColor 
} from '@/lib/styles/status-colors';
import { 
  calculateContrastRatio, 
  meetsContrastRequirement,
  validateColorAccessibility 
} from '@/lib/styles/accessibility';

// Color showcase component for development/testing
export function ColorShowcase() {
  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [testBackground, setTestBackground] = React.useState<string>('#ffffff');
  const [accessibilityResult, setAccessibilityResult] = React.useState<any>(null);

  const testAccessibility = () => {
    if (selectedColor && testBackground) {
      const result = validateColorAccessibility(selectedColor, testBackground);
      setAccessibilityResult(result);
    }
  };

  React.useEffect(() => {
    testAccessibility();
  }, [selectedColor, testBackground]);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Color System & Accessibility</h2>
        
        <div className="space-y-8">
          {/* Base Color Palette */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Base Color Palette</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(baseColors).map(([colorName, colorScale]) => (
                <Card key={colorName} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">{colorName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(colorScale).map(([shade, color]) => (
                      <div key={shade} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                          className="w-8 h-8 rounded border cursor-pointer hover:scale-110 transition-transform"
                        />
                        <span className="text-xs font-mono">{shade}</span>
                        <span className="text-xs text-muted-foreground">{color}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Semantic Colors */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Semantic Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(semanticColors).map(([category, colors]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-sm capitalize">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(colors).map(([name, color]) => (
                        <div key={name} className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedColor(color)}
                            className="w-6 h-6 rounded border cursor-pointer hover:scale-110 transition-transform"
                          />
                          <span className="text-xs capitalize">{name}</span>
                          <span className="text-xs text-muted-foreground">{color}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Status Colors */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Status Colors</h3>
            <div className="space-y-6">
              {Object.entries(statusColors).map(([category, statuses]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium mb-3 capitalize">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(statuses).map(([status, colors]) => (
                      <div key={status} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div 
                          className="w-8 h-8 rounded"
                          style={{ 
                            backgroundColor: colors.background,
                            border: `2px solid ${colors.border}`,
                            color: colors.text
                          }}
                          className="w-8 h-8 rounded flex items-center justify-center text-xs font-semibold"
                        >
                          {status.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium capitalize">{status}</div>
                          <div className="text-xs text-muted-foreground">
                            {colors.background}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Status Badges */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Status Badges</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Event Status</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge category="event" status="draft">Draft</StatusBadge>
                  <StatusBadge category="event" status="published">Published</StatusBadge>
                  <StatusBadge category="event" status="active">Active</StatusBadge>
                  <StatusBadge category="event" status="completed">Completed</StatusBadge>
                  <StatusBadge category="event" status="cancelled">Cancelled</StatusBadge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Session Status</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge category="session" status="upcoming">Upcoming</StatusBadge>
                  <StatusBadge category="session" status="ongoing">Ongoing</StatusBadge>
                  <StatusBadge category="session" status="completed">Completed</StatusBadge>
                  <StatusBadge category="session" status="cancelled">Cancelled</StatusBadge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">User Status</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge category="user" status="active">Active</StatusBadge>
                  <StatusBadge category="user" status="inactive">Inactive</StatusBadge>
                  <StatusBadge category="user" status="suspended">Suspended</StatusBadge>
                  <StatusBadge category="user" status="pending">Pending</StatusBadge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Attendance Status</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge category="attendance" status="present">Present</StatusBadge>
                  <StatusBadge category="attendance" status="absent">Absent</StatusBadge>
                  <StatusBadge category="attendance" status="late">Late</StatusBadge>
                  <StatusBadge category="attendance" status="excused">Excused</StatusBadge>
                  <StatusBadge category="attendance" status="pending">Pending</StatusBadge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Priority Levels</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge category="priority" status="low">Low</StatusBadge>
                  <StatusBadge category="priority" status="medium">Medium</StatusBadge>
                  <StatusBadge category="priority" status="high">High</StatusBadge>
                  <StatusBadge category="priority" status="critical">Critical</StatusBadge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">System Status</h4>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge category="system" status="online">Online</StatusBadge>
                  <StatusBadge category="system" status="offline">Offline</StatusBadge>
                  <StatusBadge category="system" status="maintenance">Maintenance</StatusBadge>
                  <StatusBadge category="system" status="degraded">Degraded</StatusBadge>
                </div>
              </div>
            </div>
          </section>

          {/* Accessibility Testing */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">
              <Accessibility className="inline w-5 h-5 mr-2" />
              Accessibility Testing
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Color Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Text Color</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <span className="text-sm font-mono">{selectedColor || 'Select a color'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Background Color</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={testBackground}
                          onChange={(e) => setTestBackground(e.target.value)}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <span className="text-sm font-mono">{testBackground}</span>
                      </div>
                    </div>

                    {/* Preview */}
                    {selectedColor && testBackground && (
                      <div className="p-4 rounded border" style={{ backgroundColor: testBackground }}>
                        <p style={{ color: selectedColor }}>
                          Sample text with selected colors
                        </p>
                        <p style={{ color: selectedColor }} className="text-lg font-semibold">
                          Large text sample
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Accessibility Results</h4>
                    
                    {accessibilityResult && (
                      <div className="space-y-3">
                        {/* Contrast Ratio */}
                        <div className="p-3 bg-muted rounded">
                          <div className="text-sm font-medium">Contrast Ratio</div>
                          <div className="text-2xl font-bold">
                            {calculateContrastRatio(selectedColor, testBackground).toFixed(2)}:1
                          </div>
                        </div>

                        {/* WCAG Compliance */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">WCAG 2.1 AA</span>
                            <Badge variant={meetsContrastRequirement(selectedColor, testBackground, 'AA') ? 'eventPublished' : 'eventCancelled'}>
                              {meetsContrastRequirement(selectedColor, testBackground, 'AA') ? 'Pass' : 'Fail'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">WCAG 2.1 AAA</span>
                            <Badge variant={meetsContrastRequirement(selectedColor, testBackground, 'AAA') ? 'eventPublished' : 'eventCancelled'}>
                              {meetsContrastRequirement(selectedColor, testBackground, 'AAA') ? 'Pass' : 'Fail'}
                            </Badge>
                          </div>
                        </div>

                        {/* Issues & Recommendations */}
                        {accessibilityResult.issues.length > 0 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <div className="text-sm font-medium text-red-800 mb-2">Issues</div>
                            <ul className="text-xs text-red-700 space-y-1">
                              {accessibilityResult.issues.map((issue, index) => (
                                <li key={index}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {accessibilityResult.warnings.length > 0 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="text-sm font-medium text-yellow-800 mb-2">Warnings</div>
                            <ul className="text-xs text-yellow-700 space-y-1">
                              {accessibilityResult.warnings.map((warning, index) => (
                                <li key={index}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {accessibilityResult.recommendations.length > 0 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="text-sm font-medium text-blue-800 mb-2">Recommendations</div>
                            <ul className="text-xs text-blue-700 space-y-1">
                              {accessibilityResult.recommendations.map((rec, index) => (
                                <li key={index}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Color Utilities */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Color Utilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Color with Opacity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: getColorWithOpacity('primary.500', 0.5) }} />
                    <span className="text-xs">50% opacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: getColorWithOpacity('success.500', 0.3) }} />
                    <span className="text-xs">30% opacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: getColorWithOpacity('error.500', 0.7) }} />
                    <span className="text-xs">70% opacity</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Semantic Color Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: getColor('status.success') }} />
                    <span className="text-xs">Status Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: getColor('background.accent') }} />
                    <span className="text-xs">Background Accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: getColor('border.accent') }} />
                    <span className="text-xs">Border Accent</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
