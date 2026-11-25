import Button from './Button';
import Modal from './Modal';

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    loading = false,
    destructive = false,
    onCancel,
    onConfirm,
}) {
    return (
        <Modal open={open} title={title} onClose={onCancel}>
            <div className="grid gap-6">
                <p className="leading-7 text-cod-gray/75">{description}</p>
                <div className="flex justify-end gap-3 max-sm:flex-col-reverse">
                    <Button variant="secondary" className="max-sm:w-full" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant={destructive ? 'danger' : 'primary'}
                        loading={loading}
                        className="max-sm:w-full"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
