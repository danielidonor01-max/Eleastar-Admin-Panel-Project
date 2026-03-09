import { useSettingsStore } from '../stores/useSettingsStore';
import { PinAuthorizationModal } from './PinAuthorizationModal';

export const PinModal: React.FC = () => {
    const authRequest = useSettingsStore((s) => s.authRequest);
    const clearAuthRequest = useSettingsStore((s) => s.clearAuthRequest);
    const handleAuthSuccess = useSettingsStore((s) => s.handleAuthSuccess);

    if (!authRequest) return null;

    return (
        <PinAuthorizationModal
            isOpen={true}
            requiredLevel={authRequest.level}
            description={authRequest.description}
            onClose={clearAuthRequest}
            onSuccess={handleAuthSuccess}
        />
    );
};
