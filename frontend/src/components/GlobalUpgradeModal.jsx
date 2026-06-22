import React from 'react';
import { useUploadStore } from '../store/useUploadStore';
import UpgradeModal from './UpgradeModal';

const GlobalUpgradeModal = () => {
  const { upgradeModalDetails, setUpgradeModalDetails } = useUploadStore();

  return (
    <UpgradeModal
      isOpen={!!upgradeModalDetails}
      onClose={() => setUpgradeModalDetails(null)}
      title={upgradeModalDetails?.title}
      message={upgradeModalDetails?.message}
      feature={upgradeModalDetails?.feature}
      limitType={upgradeModalDetails?.limitType}
    />
  );
};

export default GlobalUpgradeModal;
