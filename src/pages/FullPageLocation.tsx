import { useState, useCallback } from 'react';
import { Icon, cbModal, ModalHeader, ModalBody } from '@contentstack/venus-components';
import { CampaignList, CampaignForm, MetricsCard } from '../components';
import { useCampaigns } from '../contexts';
import { Campaign, CampaignFormData } from '../types';
import styles from './FullPageLocation.module.css';

type View = 'list' | 'create' | 'edit';

export function FullPageLocation() {
  const { metrics, addCampaign, updateCampaign } = useCampaigns();
  const [currentView, setCurrentView] = useState<View>('list');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const handleCreate = useCallback(() => {
    setEditingCampaign(null);
    setCurrentView('create');
  }, []);

  const handleEdit = useCallback((campaign: Campaign) => {
    setEditingCampaign(campaign);
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
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <Icon icon="Target" className={styles.logo} />
          <div>
            <h1 className={styles.title}>Campaign Manager</h1>
            <p className={styles.subtitle}>
              Manage and track your marketing campaigns
            </p>
          </div>
        </div>
        {currentView !== 'list' && (
          <button className={styles.backButton} onClick={handleFormCancel}>
            <Icon icon="ChevronLeft" />
            Back to Campaigns
          </button>
        )}
      </header>

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

      <main className={styles.main}>
        {currentView === 'list' && (
          <CampaignList onEdit={handleEdit} onCreate={handleCreate} />
        )}
        {(currentView === 'create' || currentView === 'edit') && (
          <CampaignForm
            campaign={editingCampaign}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </main>
    </div>
  );
}
