export default function EmployeeTable({
    employees,
    canManage,
    onEdit,
    onDeactivate,
    onReactivate,
}) {
    return (
        <div className="border-cod-gray/20 bg-cararra overflow-x-auto rounded-2xl border shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
                <thead>
                    <tr className="bg-cod-gray text-cararra text-xs">
                        <th className="border-cod-gray border-b p-4">
                            Employee
                        </th>
                        <th className="border-cod-gray border-b p-4">Role</th>
                        <th className="border-cod-gray border-b p-4">
                            Department
                        </th>
                        <th className="border-cod-gray border-b p-4">
                            Manager
                        </th>
                        <th className="border-cod-gray border-b p-4">Status</th>
                        {canManage && (
                            <th className="border-cod-gray border-b p-4">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee) => (
                        <tr className="text-cod-gray" key={employee.id}>
                            <td className="border-cod-gray/15 border-b p-4">
                                <strong className="text-cod-gray block">
                                    {employee.user.name}
                                </strong>
                                <small className="text-cod-gray/70">
                                    {employee.employee_number} /{' '}
                                    {employee.user.email}
                                </small>
                            </td>
                            <td className="border-cod-gray/15 border-b p-4 capitalize">
                                {employee.user.roles
                                    .map((role) => role.name)
                                    .join(', ')}
                            </td>
                            <td className="border-cod-gray/15 border-b p-4">
                                {employee.department}
                                <small className="text-cod-gray/70 block">
                                    {employee.job_title}
                                </small>
                            </td>
                            <td className="border-cod-gray/15 border-b p-4">
                                {employee.manager?.user.name ?? '-'}
                            </td>
                            <td className="border-cod-gray/15 border-b p-4">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${employee.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'}`}
                                >
                                    {employee.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            {canManage && (
                                <td className="border-cod-gray/15 border-b p-4">
                                    <div className="flex gap-2">
                                        <button
                                            className="border-cod-gray hover:border-pomegranate rounded-lg border px-3 py-2 font-bold"
                                            onClick={() => onEdit(employee)}
                                        >
                                            Edit
                                        </button>
                                        {employee.is_active ? (
                                            <button
                                                className="bg-cod-gray text-cararra hover:outline-pomegranate rounded-lg px-3 py-2 font-bold hover:outline-2"
                                                onClick={() =>
                                                    onDeactivate(employee)
                                                }
                                            >
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                className="rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-2 font-bold text-emerald-800 hover:bg-emerald-100"
                                                onClick={() =>
                                                    onReactivate(employee)
                                                }
                                            >
                                                Reactivate
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
