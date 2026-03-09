import { useConfirmStore } from '../stores/useConfirmStore';
import { ConfirmationModal } from './ConfirmationModal';

export const ConfirmModal: React.FC = () => {
    const modal = useConfirmStore((s) => s.modal);
    const handleConfirm = useConfirmStore((s) => s.handleConfirm);
    const handleCancel = useConfirmStore((s) => s.handleCancel);

    if (!modal) return null;

    return (
        <ConfirmationModal
            isOpen={modal.isOpen}
            title={modal.title}
            message={modal.message}
            confirmLabel={modal.confirmLabel}
            cancelLabel={modal.cancelLabel}
            isDestructive={modal.isDestructive}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
};
