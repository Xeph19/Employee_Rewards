export const queryKeys = {
    dashboard: ['dashboard'],
    employees: ['employees'],
    connectivity: ['connectivity'],
    catalogue: (filters) => ['catalogue', filters],
    redemptions: (page) => ['redemptions', page],
    recognitions: (page) => ['recognitions', page],
};
