const api = '/api/v1';

export const apiRoutes = {
    csrf: '/sanctum/csrf-cookie',
    session: `${api}/session`,
    dashboard: `${api}/dashboard`,
    connectivity: `${api}/connectivity`,
    catalogue: `${api}/catalogue`,
    adminMerchants: `${api}/admin/merchants`,
    adminRewards: `${api}/admin/rewards`,
    redemptions: `${api}/redemptions`,
    messageSuggestions: `${api}/message-suggestions`,
    employees: `${api}/employees`,
    employee: (employee) => `${api}/employees/${employee}`,
    recognitions: `${api}/recognitions`,
    recognitionRevocations: (recognition) =>
        `${api}/recognitions/${recognition}/revocations`,
    occasions: `${api}/occasions`,
    occasion: (occasion) => `${api}/occasions/${occasion}`,
    companyValues: `${api}/company-values`,
    companyValue: (companyValue) => `${api}/company-values/${companyValue}`,
    analyticsEmployee: `${api}/analytics/employee`,
    analyticsPersonalExport: `${api}/analytics/personal-export`,
    analyticsAdminSummary: `${api}/analytics/admin/summary`,
    analyticsAdminSystemExport: `${api}/analytics/admin/system-export`,
};
