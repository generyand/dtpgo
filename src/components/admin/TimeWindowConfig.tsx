'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

interface TimeWindowConfigProps {
    className?: string;
}

interface TimeWindowFormData {
    timeInStart: string;
    timeInEnd: string;
    timeOutStart?: string;
    timeOutEnd?: string;
}

export function TimeWindowConfig({ className }: TimeWindowConfigProps) {
    const { register, watch, formState: { errors } } = useFormContext<TimeWindowFormData>();

    const timeInStart = watch('timeInStart');
    const timeInEnd = watch('timeInEnd');
    const timeOutStart = watch('timeOutStart');
    const timeOutEnd = watch('timeOutEnd');

    // Helper function to format datetime-local input value
    const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Helper function to get default values
    const getDefaultTimeInStart = () => {
        const now = new Date();
        now.setHours(8, 0, 0, 0); // Default to 8:00 AM
        return formatDateTimeLocal(now);
    };

    const getDefaultTimeInEnd = () => {
        const now = new Date();
        now.setHours(9, 0, 0, 0); // Default to 9:00 AM
        return formatDateTimeLocal(now);
    };

    const getDefaultTimeOutStart = () => {
        const now = new Date();
        now.setHours(16, 0, 0, 0); // Default to 4:00 PM
        return formatDateTimeLocal(now);
    };

    const getDefaultTimeOutEnd = () => {
        const now = new Date();
        now.setHours(17, 0, 0, 0); // Default to 5:00 PM
        return formatDateTimeLocal(now);
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
                                <Label htmlFor="timeInStart" className="text-sm font-medium">
                                    Start Time *
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="timeInStart"
                                        type="datetime-local"
                                        className="pl-10"
                                        {...register('timeInStart', {
                                            required: 'Time-in start time is required',
                                            validate: (value) => {
                                                if (!value) return 'Time-in start time is required';
                                                const start = new Date(value);
                                                const end = new Date(timeInEnd);
                                                if (start >= end) {
                                                    return 'Start time must be before end time';
                                                }
                                                return true;
                                            }
                                        })}
                                        defaultValue={getDefaultTimeInStart()}
                                    />
                                </div>
                                {errors.timeInStart && (
                                    <p className="text-sm text-red-600">{errors.timeInStart.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeInEnd" className="text-sm font-medium">
                                    End Time *
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="timeInEnd"
                                        type="datetime-local"
                                        className="pl-10"
                                        {...register('timeInEnd', {
                                            required: 'Time-in end time is required',
                                            validate: (value) => {
                                                if (!value) return 'Time-in end time is required';
                                                const start = new Date(timeInStart);
                                                const end = new Date(value);
                                                if (start >= end) {
                                                    return 'End time must be after start time';
                                                }
                                                return true;
                                            }
                                        })}
                                        defaultValue={getDefaultTimeInEnd()}
                                    />
                                </div>
                                {errors.timeInEnd && (
                                    <p className="text-sm text-red-600">{errors.timeInEnd.message}</p>
                                )}
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
                                <Label htmlFor="timeOutStart" className="text-sm font-medium">
                                    Start Time
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="timeOutStart"
                                        type="datetime-local"
                                        className="pl-10"
                                        {...register('timeOutStart', {
                                            validate: (value) => {
                                                if (!value) return true; // Optional field
                                                const start = new Date(value);
                                                const end = new Date(timeOutEnd!);
                                                if (timeOutEnd && start >= end) {
                                                    return 'Start time must be before end time';
                                                }
                                                return true;
                                            }
                                        })}
                                        defaultValue={getDefaultTimeOutStart()}
                                    />
                                </div>
                                {errors.timeOutStart && (
                                    <p className="text-sm text-red-600">{errors.timeOutStart.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeOutEnd" className="text-sm font-medium">
                                    End Time
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="timeOutEnd"
                                        type="datetime-local"
                                        className="pl-10"
                                        {...register('timeOutEnd', {
                                            validate: (value) => {
                                                if (!value) return true; // Optional field
                                                const start = new Date(timeOutStart!);
                                                const end = new Date(value);
                                                if (timeOutStart && start >= end) {
                                                    return 'End time must be after start time';
                                                }
                                                return true;
                                            }
                                        })}
                                        defaultValue={getDefaultTimeOutEnd()}
                                    />
                                </div>
                                {errors.timeOutEnd && (
                                    <p className="text-sm text-red-600">{errors.timeOutEnd.message}</p>
                                )}
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
