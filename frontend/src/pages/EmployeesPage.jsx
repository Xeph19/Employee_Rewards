import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import Modal from '../components/common/Modal';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeEditForm from '../components/employees/EmployeeEditForm';
import EmployeeTable from '../components/employees/EmployeeTable';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Icon from '../components/common/Icon';

export default function EmployeesPage({
    canManage,
    onCreated,
}) {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deactivating, setDeactivating] = useState(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const employeesQuery = useQuery({
        queryKey: ['employees', page, search],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('per_page', 10);
            if (search) params.set('search', search);
            return apiClient.get(`${apiRoutes.employees}?${params.toString()}`);
        },
    });

    // All employees for manager dropdown
    const allEmployeesQuery = useQuery({
        queryKey: ['employees', 'all'],
        queryFn: () => apiClient.get(`${apiRoutes.employees}?all=true`),
    });

    const deactivateEmployee = useMutation({
        mutationFn: (id) => apiClient.delete(apiRoutes.employee(id)),
    });
    const updateEmployee = useMutation({
        mutationFn: ({ id, data }) =>
            apiClient.patch(apiRoutes.employee(id), data),
    });

    const refreshData = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['employees'] }),
            onCreated(),
        ]);
    };

    const created = async () => {
        await refreshData();
        setFormOpen(false);
    };
    const saved = async () => {
        await refreshData();
        setEditing(null);
    };
    const deactivate = async () => {
        if (!deactivating) return;
        await deactivateEmployee.mutateAsync(deactivating.id);
        await refreshData();
        setDeactivating(null);
    };
    const reactivate = async (employee) => {
        await updateEmployee.mutateAsync({
            id: employee.id,
            data: { is_active: true },
        });
        await refreshData();
    };

    const employees = employeesQuery.data?.data ?? [];
    const meta = employeesQuery.data?.meta ?? {
        current_page: 1,
        last_page: 1,
        total: employees.length,
    };
    const allEmployees = allEmployeesQuery.data?.data ?? employees;

    return (
        <>
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <span className="text-cod-gray text-xs font-extrabold tracking-[.14em] uppercase">
                        People directory
                    </span>
                    <h1 className="text-cod-gray text-3xl font-semibold">
                        Employee administration
                    </h1>
                    <p className="text-cod-gray/75">
                        Manage people, reporting lines, roles, and award
                        eligibility.
                    </p>
                </div>
                <span className="border-cod-gray/20 text-cod-gray rounded-full border px-3 py-1.5 text-xs font-semibold max-sm:hidden">
                    {meta.total} employees total
                </span>
            </div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="relative min-w-[280px] max-w-md flex-1">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search employee by name, email, or dept..."
                        aria-label="Search employee by name"
                        className="w-full rounded-xl border border-cod-gray/30 bg-white px-4 py-2.5 text-sm text-cod-gray placeholder:text-cod-gray/45 focus:border-cod-gray focus:outline-none"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => setSearchInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-cod-gray/50 hover:text-cod-gray"
                        >
                            Clear
                        </button>
                    )}
                </div>
                {canManage && (
                    <Button
                        size="lg"
                        onClick={() => setFormOpen(true)}
                    >
                        <Icon name="plus" />
                        Add employee
                    </Button>
                )}
            </div>
            {employeesQuery.isPending ? (
                <div className="border-cod-gray/20 text-cod-gray rounded-2xl border p-10 text-center font-semibold">
                    Loading employees...
                </div>
            ) : employees.length === 0 ? (
                <div
                    role="region"
                    aria-label="No employees available"
                    className="border-cod-gray/20 bg-cararra grid min-h-60 place-items-center rounded-2xl border text-center p-6"
                >
                    <div>
                        <h2 className="text-cod-gray text-lg font-semibold">
                            No employees found
                        </h2>
                        <p className="text-cod-gray/70 text-sm">
                            Add team members to enable award allocations.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <EmployeeTable
                        employees={employees}
                        canManage={canManage}
                        onEdit={setEditing}
                        onDeactivate={setDeactivating}
                        onReactivate={reactivate}
                    />

                    {/* Pagination Controls */}
                    <div className="mt-4 flex items-center justify-between border-t border-cod-gray/15 pt-4 text-xs">
                        <span className="text-cod-gray/70">
                            Showing page <strong className="text-cod-gray">{meta.current_page}</strong> of{' '}
                            <strong className="text-cod-gray">{meta.last_page}</strong> ({meta.total} employees)
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={meta.current_page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Previous
                            </Button>
                            <span className="px-2 font-bold text-cod-gray">{meta.current_page}</span>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={meta.current_page >= meta.last_page}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
            <Modal
                open={formOpen}
                title="Employee Administration: Add Employee"
                onClose={() => setFormOpen(false)}
            >
                <EmployeeForm employees={allEmployees} onCreated={created} />
            </Modal>
            <Modal
                open={Boolean(editing)}
                title="Employee Administration: Edit Employee"
                onClose={() => setEditing(null)}
            >
                {editing && (
                    <EmployeeEditForm
                        employee={editing}
                        employees={allEmployees}
                        onSaved={saved}
                    />
                )}
            </Modal>
            <ConfirmDialog
                open={Boolean(deactivating)}
                title="Employee Administration: Deactivate Employee"
                description={`${deactivating?.user.name ?? 'This employee'} will no longer be eligible for awards, but their historical recognitions will be preserved.`}
                confirmLabel="Deactivate employee"
                destructive
                loading={deactivateEmployee.isPending}
                onCancel={() => setDeactivating(null)}
                onConfirm={deactivate}
            />
        </>
    );
}
