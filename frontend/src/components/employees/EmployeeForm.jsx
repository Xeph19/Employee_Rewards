import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '../../api/client';
import { apiRoutes } from '../../api/routes';
import Button from '../common/Button';
import Icon from '../common/Icon';

const departments = ['Engineering', 'Finance', 'Human Resources', 'Marketing', 'Operations', 'Product', 'Sales'];
const jobTitles = ['Analyst', 'Associate', 'Engineer', 'Manager', 'Product Manager', 'Senior Engineer', 'Specialist'];

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
            <input name="name" required placeholder="Full name" aria-label="Full name" />
            <input name="email" type="email" required placeholder="Email" aria-label="Email" />
            <input
                name="password"
                type="password"
                required
                minLength="8"
                placeholder="Temporary password"
                aria-label="Temporary password"
            />
            <input
                name="employee_number"
                required
                placeholder="Employee number"
                aria-label="Employee number"
            />
            <input name="department" list="department-suggestions" required placeholder="Department" aria-label="Department" />
            <datalist id="department-suggestions">{departments.map((department) => <option key={department} value={department} />)}</datalist>
            <input name="job_title" list="job-title-suggestions" required placeholder="Job title" aria-label="Job title" />
            <datalist id="job-title-suggestions">{jobTitles.map((title) => <option key={title} value={title} />)}</datalist>
            <select name="role" defaultValue="employee" aria-label="Role">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
            </select>
            <select name="manager_id" defaultValue="" aria-label="Manager">
                <option value="">No manager</option>
                {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                        {manager.user.name}
                    </option>
                ))}
            </select>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-cod-gray/70">Joined Date</label>
                <input name="joined_at" type="date" aria-label="Join date" />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-cod-gray/70">Birth Date</label>
                <input name="birth_date" type="date" aria-label="Birth date" />
            </div>
            <div role="alert" className="border-pomegranate text-cod-gray col-span-full grid gap-1 border-l-4 px-3 text-sm font-semibold">
                {Object.values(errors)
                    .flat()
                    .map((error) => (
                        <span key={error}>{error}</span>
                    ))}
            </div>
            <Button
                type="submit"
                size="lg"
                loading={createEmployee.isPending}
                className="col-span-full w-full"
            >
                <Icon name="users" />
                {createEmployee.isPending ? 'Creating...' : 'Create employee'}
            </Button>
        </form>
    );
}
