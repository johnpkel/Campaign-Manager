import { useState, useCallback } from 'react';
import { Icon, cbModal, ModalHeader, ModalBody } from '@contentstack/venus-components';
import { CampaignList, CampaignForm, CampaignDetail, MetricsCard } from '../components';
import { useCampaigns } from '../contexts';
import { useExperience, ExperienceDashboard, ModuleView } from '../experience';
import { ActivityFeed } from '../modules/collaboration';
import { Campaign, CampaignFormData } from '../types';
import styles from './FullPageLocation.module.css';

type CampaignView = 'list' | 'detail' | 'create' | 'edit';

function CampaignModule() {
  const { metrics, addCampaign, updateCampaign } = useCampaigns();
  const [currentView, setCurrentView] = useState<CampaignView>('list');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);

  const handleCreate = useCallback(() => {
    setEditingCampaign(null);
    setViewingCampaign(null);
    setCurrentView('create');
  }, []);

  const handleView = useCallback((campaign: Campaign) => {
    setViewingCampaign(campaign);
    setEditingCampaign(null);
    setCurrentView('detail');
  }, []);

  const handleEdit = useCallback((campaign: Campaign) => {
    setEditingCampaign(campaign);
    setViewingCampaign(null);
    setCurrentView('edit');
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CampaignFormData) => {
      try {
        if (editingCampaign) {
          await updateCampaign(editingCampaign.uid, data);
          cbModal({
            component: (props: { closeModal: () => void }) => (
              <div>
                <ModalHeader title="Success" closeModal={props.closeModal} />
                <ModalBody>
                  <p>Campaign updated successfully!</p>
                </ModalBody>
              </div>
            ),
            modalProps: { size: 'small' },
          });
        } else {
          await addCampaign(data);
          cbModal({
            component: (props: { closeModal: () => void }) => (
              <div>
                <ModalHeader title="Success" closeModal={props.closeModal} />
                <ModalBody>
                  <p>Campaign created successfully!</p>
                </ModalBody>
              </div>
            ),
            modalProps: { size: 'small' },
          });
        }
        setCurrentView('list');
        setEditingCampaign(null);
      } catch (error) {
        cbModal({
          component: (props: { closeModal: () => void }) => (
            <div>
              <ModalHeader title="Error" closeModal={props.closeModal} />
              <ModalBody>
                <p>Failed to save campaign. Please try again.</p>
              </ModalBody>
            </div>
          ),
          modalProps: { size: 'small' },
        });
      }
    },
    [editingCampaign, addCampaign, updateCampaign]
  );

  const handleFormCancel = useCallback(() => {
    setCurrentView('list');
    setEditingCampaign(null);
    setViewingCampaign(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView('list');
    setViewingCampaign(null);
    setEditingCampaign(null);
  }, []);

  const handleEditFromDetail = useCallback(() => {
    if (viewingCampaign) {
      setEditingCampaign(viewingCampaign);
      setCurrentView('edit');
    }
  }, [viewingCampaign]);

  return (
    <div className={styles.moduleContent}>
      {(currentView === 'create' || currentView === 'edit') && (
        <button className={styles.backButton} onClick={handleFormCancel}>
          <Icon icon="ChevronLeft" />
          Back to Campaigns
        </button>
      )}

      {currentView === 'list' && (
        <div className={styles.metricsBar}>
          <MetricsCard
            title="Total Campaigns"
            value={metrics.totalCampaigns}
            icon="Folder"
            color="#6366f1"
          />
          <MetricsCard
            title="Active"
            value={metrics.activeCampaigns}
            icon="Play"
            color="#10b981"
          />
          <MetricsCard
            title="Paused"
            value={metrics.campaignsByStatus.paused}
            icon="Pause"
            color="#f59e0b"
          />
          <MetricsCard
            title="Completed"
            value={metrics.campaignsByStatus.completed}
            icon="CheckCircle"
            color="#8b5cf6"
          />
        </div>
      )}

      <div className={styles.moduleMain}>
        {currentView === 'list' && (
          <CampaignList onEdit={handleEdit} onCreate={handleCreate} onView={handleView} />
        )}
        {currentView === 'detail' && viewingCampaign && (
          <CampaignDetail
            campaign={viewingCampaign}
            onEdit={handleEditFromDetail}
            onBack={handleBackToList}
          />
        )}
        {(currentView === 'create' || currentView === 'edit') && (
          <CampaignForm
            campaign={editingCampaign}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </div>
    </div>
  );
}

function AnalyticsModule() {
  return (
    <div className={styles.moduleContent}>
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>📊</div>
        <h2>Analytics Dashboard</h2>
        <p>
          Detailed analytics and insights from your marketing channels.
          Connect Lytics, Google Analytics, and other data sources.
        </p>
      </div>
    </div>
  );
}

function CollaborationModule() {
  return (
    <div className={styles.moduleContent}>
      <ActivityFeed />
    </div>
  );
}

export function FullPageLocation() {
  const { activeModule, isModuleExpanded } = useExperience();

  // Show dashboard when no module is expanded
  if (!isModuleExpanded || !activeModule) {
    return <ExperienceDashboard />;
  }

  // Show the expanded module view
  const renderModule = () => {
    switch (activeModule) {
      case 'campaigns':
      case 'upcoming':
        return <CampaignModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'collaboration':
        return <CollaborationModule />;
      default:
        return null;
    }
  };

  return (
    <ModuleView moduleId={activeModule}>
      {renderModule()}
    </ModuleView>
  );
}
