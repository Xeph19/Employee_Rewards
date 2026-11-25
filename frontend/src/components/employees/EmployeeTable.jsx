import Button from '../common/Button';
import Icon from '../common/Icon';

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
                            Dates (Join / Birth)
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
                            <td className="border-cod-gray/15 border-b p-4 text-xs">
                                <div><span className="text-cod-gray/60">Joined:</span> {employee.joined_at ? new Date(employee.joined_at).toLocaleDateString() : '-'}</div>
                                <div><span className="text-cod-gray/60">Birth:</span> {employee.birth_date ? new Date(employee.birth_date).toLocaleDateString() : '-'}</div>
                            </td>
                            <td className="border-cod-gray/15 border-b p-4">
                                {employee.manager?.user.name ?? '-'}
                            </td>
                            <td className="border-cod-gray/15 border-b p-4">
                                <span
                                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${employee.is_active ? 'border-cod-gray bg-cod-gray text-cararra' : 'border-cod-gray/20 bg-cod-gray/5 text-cod-gray/65'}`}
                                >
                                    {employee.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            {canManage && (
                                <td className="border-cod-gray/15 border-b p-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onEdit(employee)}
                                        >
                                            <Icon name="edit" /> Edit
                                        </Button>
                                        {employee.is_active ? (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() =>
                                                    onDeactivate(employee)
                                                }
                                            >
                                                <Icon name="pause" /> Deactivate
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    onReactivate(employee)
                                                }
                                            >
                                                <Icon name="play" /> Reactivate
                                            </Button>
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
