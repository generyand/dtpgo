'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Clock, Calendar } from 'lucide-react';

interface TimeWindowConfigProps {
    className?: string;
}

interface TimeWindowFormData {
    timeInStart: Date;
    timeInEnd: Date;
    timeOutStart?: Date;
    timeOutEnd?: Date;
}

export function TimeWindowConfig({ className }: TimeWindowConfigProps) {
    const { control, watch, formState: { errors } } = useFormContext<TimeWindowFormData>();

    const timeInStart = watch('timeInStart');
    const timeInEnd = watch('timeInEnd');
    const timeOutStart = watch('timeOutStart');
    const timeOutEnd = watch('timeOutEnd');

    // Helper function to get default values
    const getDefaultTimeInStart = () => {
        const now = new Date();
        now.setHours(8, 0, 0, 0); // Default to 8:00 AM
        return now;
    };

    const getDefaultTimeInEnd = () => {
        const now = new Date();
        now.setHours(9, 0, 0, 0); // Default to 9:00 AM
        return now;
    };

    const getDefaultTimeOutStart = () => {
        const now = new Date();
        now.setHours(16, 0, 0, 0); // Default to 4:00 PM
        return now;
    };

    const getDefaultTimeOutEnd = () => {
        const now = new Date();
        now.setHours(17, 0, 0, 0); // Default to 5:00 PM
        return now;
    };

    return (
        <div className={className}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Time Window Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure the time windows for student check-in and check-out during this session.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Time-In Window */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <h4 className="font-semibold text-green-700">Time-In Window</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            Students can check in during this time period.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Controller
                                    name="timeInStart"
                                    control={control}
                                    rules={{
                                        required: 'Time-in start time is required',
                                        validate: (value) => {
                                            if (!value) return 'Time-in start time is required';
                                            if (timeInEnd && value >= timeInEnd) {
                                                return 'Start time must be before end time';
                                            }
                                            return true;
                                        }
                                    }}
                                    defaultValue={getDefaultTimeInStart()}
                                    render={({ field }) => (
                                        <DateTimePicker
                                            label="Start Time *"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.timeInStart?.message}
                                            minDate={new Date()}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Controller
                                    name="timeInEnd"
                                    control={control}
                                    rules={{
                                        required: 'Time-in end time is required',
                                        validate: (value) => {
                                            if (!value) return 'Time-in end time is required';
                                            if (timeInStart && timeInStart >= value) {
                                                return 'End time must be after start time';
                                            }
                                            return true;
                                        }
                                    }}
                                    defaultValue={getDefaultTimeInEnd()}
                                    render={({ field }) => (
                                        <DateTimePicker
                                            label="End Time *"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.timeInEnd?.message}
                                            minDate={timeInStart || new Date()}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Time-Out Window */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <h4 className="font-semibold text-blue-700">Time-Out Window (Optional)</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            Students can check out during this time period. Leave empty if no check-out is required.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Controller
                                    name="timeOutStart"
                                    control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (!value) return true; // Optional field
                                            if (timeOutEnd && value >= timeOutEnd) {
                                                return 'Start time must be before end time';
                                            }
                                            return true;
                                        }
                                    }}
                                    defaultValue={getDefaultTimeOutStart()}
                                    render={({ field }) => (
                                        <DateTimePicker
                                            label="Start Time"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.timeOutStart?.message}
                                            minDate={new Date()}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Controller
                                    name="timeOutEnd"
                                    control={control}
                                    rules={{
                                        validate: (value) => {
                                            if (!value) return true; // Optional field
                                            if (timeOutStart && timeOutStart >= value) {
                                                return 'End time must be after start time';
                                            }
                                            return true;
                                        }
                                    }}
                                    defaultValue={getDefaultTimeOutEnd()}
                                    render={({ field }) => (
                                        <DateTimePicker
                                            label="End Time"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.timeOutEnd?.message}
                                            minDate={timeOutStart || new Date()}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Time Window Preview */}
                    {(timeInStart || timeInEnd || timeOutStart || timeOutEnd) && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">Time Window Preview</h5>
                            <div className="space-y-2 text-sm">
                                {timeInStart && timeInEnd && (
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <span className="text-gray-700">
                                            <strong>Time-In:</strong> {new Date(timeInStart).toLocaleString()} - {new Date(timeInEnd).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {timeOutStart && timeOutEnd && (
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        <span className="text-gray-700">
                                            <strong>Time-Out:</strong> {new Date(timeOutStart).toLocaleString()} - {new Date(timeOutEnd).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
