import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiError, apiClient } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import Button from '../common/Button';

export default function EmployeeEditForm({ employee, employees, onSaved }) {
    const [errors, setErrors] = useState({});
    const [isActive, setIsActive] = useState(Boolean(employee.is_active));
    const updateEmployee = useMutation({
        mutationFn: (data) =>
            apiClient.patch(apiRoutes.employee(employee.id), data),
    });
    const managers = employees.filter(
        (item) =>
            item.id !== employee.id &&
            item.is_active &&
            item.user.roles.some((role) => role.name === 'manager'),
    );

    const submit = async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        try {
            await updateEmployee.mutateAsync({
                ...data,
                manager_id: data.manager_id ? Number(data.manager_id) : null,
                is_active: isActive,
            });
            setErrors({});
            await onSaved();
        } catch (error) {
            setErrors(
                error instanceof ApiError
                    ? error.errors
                    : { request: [error.message] },
            );
        }
    };

    return (
        <form
            className="grid grid-cols-2 gap-3 max-sm:grid-cols-1"
            onSubmit={submit}
        >
            <input
                name="name"
                required
                defaultValue={employee.user.name}
                aria-label="Full name"
                placeholder="Full name"
            />
            <input
                name="email"
                type="email"
                required
                defaultValue={employee.user.email}
                aria-label="Email"
                placeholder="Email"
            />
            <input
                name="employee_number"
                required
                defaultValue={employee.employee_number}
                aria-label="Employee number"
                placeholder="Employee number"
            />
            <input
                name="department"
                required
                defaultValue={employee.department}
                aria-label="Department"
                placeholder="Department"
            />
            <input
                name="job_title"
                required
                defaultValue={employee.job_title}
                aria-label="Job title"
                placeholder="Job title"
            />
            <select
                name="role"
                defaultValue={employee.user.roles[0]?.name ?? 'employee'}
                aria-label="Role"
            >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
            </select>
            <select
                name="manager_id"
                defaultValue={employee.manager_id ?? ''}
                aria-label="Manager"
            >
                <option value="">No manager</option>
                {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                        {manager.user.name}
                    </option>
                ))}
            </select>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-cod-gray/70">Joined Date</label>
                <input
                    name="joined_at"
                    type="date"
                    defaultValue={employee.joined_at?.slice(0, 10) ?? ''}
                    aria-label="Join date"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-cod-gray/70">Birth Date</label>
                <input
                    name="birth_date"
                    type="date"
                    defaultValue={employee.birth_date?.slice(0, 10) ?? ''}
                    aria-label="Birth date"
                />
            </div>
            <div className="border-cod-gray/20 bg-cararra col-span-full flex items-center justify-between rounded-xl border p-3">
                <label className="text-cod-gray flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="size-4 rounded"
                    />
                    Active employee status
                </label>
                <span className="text-cod-gray/60 text-xs">
                    {isActive
                        ? 'Eligible for awards and reports'
                        : 'Deactivated profile'}
                </span>
            </div>
            {Object.keys(errors).length > 0 && (
                <div className="border-pomegranate text-cod-gray col-span-full grid gap-1 border-l-4 px-3 text-sm font-semibold">
                    {Object.values(errors)
                        .flat()
                        .map((error) => (
                            <span key={error}>{error}</span>
                        ))}
                </div>
            )}
            <Button
                type="submit"
                size="lg"
                loading={updateEmployee.isPending}
                className="col-span-full w-full"
            >
                {updateEmployee.isPending ? 'Saving...' : 'Save changes'}
            </Button>
        </form>
    );
}
