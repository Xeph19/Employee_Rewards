import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '../../api/client';
import { apiRoutes } from '../../api/routes';

export default function EmployeeForm({ employees, onCreated }) {
    const [errors, setErrors] = useState({});
    const createEmployee = useMutation({
        mutationFn: (data) => apiClient.post(apiRoutes.employees, data),
    });

    const submit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        try {
            await createEmployee.mutateAsync({
                ...data,
                manager_id: data.manager_id ? Number(data.manager_id) : null,
            });
            form.reset();
            setErrors({});
            await onCreated();
        } catch (error) {
            setErrors(error instanceof ApiError ? error.errors : {});
        }
    };

    const managers = employees.filter((employee) =>
        employee.user.roles.some((role) => role.name === 'manager'),
    );

    return (
        <form
            className="grid grid-cols-2 gap-3 max-sm:grid-cols-1"
            onSubmit={submit}
        >
            <input name="name" required placeholder="Full name" />
            <input name="email" type="email" required placeholder="Email" />
            <input
                name="password"
                type="password"
                required
                minLength="8"
                placeholder="Temporary password"
            />
            <input
                name="employee_number"
                required
                placeholder="Employee number"
            />
            <input name="department" required placeholder="Department" />
            <input name="job_title" required placeholder="Job title" />
            <select name="role" defaultValue="employee">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
            </select>
            <select name="manager_id" defaultValue="">
                <option value="">No manager</option>
                {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                        {manager.user.name}
                    </option>
                ))}
            </select>
            <input name="joined_at" type="date" />
            <div className="border-pomegranate text-cod-gray col-span-full grid gap-1 border-l-4 px-3 text-sm font-semibold">
                {Object.values(errors)
                    .flat()
                    .map((error) => (
                        <span key={error}>{error}</span>
                    ))}
            </div>
            <button
                disabled={createEmployee.isPending}
                className="bg-cod-gray text-cararra hover:outline-pomegranate col-span-full rounded-xl px-4 py-3 font-bold transition hover:-translate-y-px hover:outline-2 disabled:cursor-wait disabled:opacity-60"
            >
                {createEmployee.isPending ? 'Creating...' : 'Create employee'}
            </button>
        </form>
    );
}
