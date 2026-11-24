import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { apiRoutes } from '../api/routes';
import Modal from '../components/common/Modal';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeEditForm from '../components/employees/EmployeeEditForm';
import EmployeeTable from '../components/employees/EmployeeTable';

export default function EmployeesPage({
    employees,
    loading,
    canManage,
    onCreated,
}) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const deactivateEmployee = useMutation({
        mutationFn: (id) => apiClient.delete(apiRoutes.employee(id)),
    });
    const updateEmployee = useMutation({
        mutationFn: ({ id, data }) =>
            apiClient.patch(apiRoutes.employee(id), data),
    });
    const created = async () => {
        await onCreated();
        setFormOpen(false);
    };
    const saved = async () => {
        await onCreated();
        setEditing(null);
    };
    const deactivate = async (employee) => {
        if (
            !window.confirm(
                `Deactivate ${employee.user.name}? Their historical recognitions will be preserved.`,
            )
        )
            return;
        await deactivateEmployee.mutateAsync(employee.id);
        await onCreated();
    };
    const reactivate = async (employee) => {
        await updateEmployee.mutateAsync({
            id: employee.id,
            data: { is_active: true },
        });
        await onCreated();
    };

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
                    {employees.length} employees
                </span>
            </div>
            {canManage && (
                <button
                    className="bg-cod-gray text-cararra hover:outline-pomegranate mb-5 rounded-xl px-5 py-3 font-bold transition hover:outline-2"
                    onClick={() => setFormOpen(true)}
                >
                    Add employee
                </button>
            )}
            {loading ? (
                <div className="border-cod-gray/20 text-cod-gray rounded-2xl border p-10 text-center font-semibold">
                    Loading employees...
                </div>
            ) : (
                <EmployeeTable
                    employees={employees}
                    canManage={canManage}
                    onEdit={setEditing}
                    onDeactivate={deactivate}
                    onReactivate={reactivate}
                />
            )}
            <Modal
                open={formOpen}
                title="Add employee"
                onClose={() => setFormOpen(false)}
            >
                <EmployeeForm employees={employees} onCreated={created} />
            </Modal>
            <Modal
                open={Boolean(editing)}
                title="Edit employee"
                onClose={() => setEditing(null)}
            >
                {editing && (
                    <EmployeeEditForm
                        employee={editing}
                        employees={employees}
                        onSaved={saved}
                    />
                )}
            </Modal>
        </>
    );
}
