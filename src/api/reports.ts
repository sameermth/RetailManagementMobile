import apiClient from './client';

export interface ReportRequest {
    reportType: string;
    startDate: string;
    endDate: string;
    format: 'json' | 'pdf' | 'excel' | 'csv';
    params?: Record<string, any>;
}

export interface ScheduledReport {
    id: number;
    name: string;
    reportType: string;
    frequency: string;
    recipients: string[];
    nextRun: string;
    isActive: boolean;
}

export const reportsApi = {
    generate: (data: ReportRequest) =>
        apiClient.post('/reports/generate', data),

    download: (data: ReportRequest) =>
        apiClient.post('/reports/download', data, {
            responseType: 'blob',
        }),

    getFormats: (reportType: string) =>
        apiClient.get<string[]>(`/reports/formats/${reportType}`),

    getScheduled: () =>
        apiClient.get<ScheduledReport[]>('/reports/schedules'),

    createSchedule: (data: any) =>
        apiClient.post('/reports/schedules', data),

    updateSchedule: (id: number, data: any) =>
        apiClient.put(`/reports/schedules/${id}`, data),

    deleteSchedule: (id: number) =>
        apiClient.delete(`/reports/schedules/${id}`),

    toggleSchedule: (id: number, isActive: boolean) =>
        apiClient.patch(`/reports/schedules/${id}`, { isActive }),
};