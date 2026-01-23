import { useState, useMemo } from 'react';
import {
  Button,
  Icon,
  Tooltip,
  Search,
  Dropdown,
  cbModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ButtonGroup,
} from '@contentstack/venus-components';
import { useCampaigns } from '../../../contexts';
import {
  Campaign,
  CampaignStatus,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_CHANNEL_LABELS,
  ALL_CAMPAIGN_STATUSES,
} from '../types';
import { formatDate, getStatusColor } from '../utils';
import styles from './CampaignList.module.css';

interface CampaignListProps {
  onEdit: (campaign: Campaign) => void;
  onCreate: () => void;
  onView?: (campaign: Campaign) => void;
  onWizard?: () => void;
}

type SortableField = 'title' | 'status' | 'start_date' | 'end_date' | 'updated_at';

export function CampaignList({ onEdit, onCreate, onView, onWizard }: CampaignListProps) {
  const { campaigns, deleteCampaign, isLoading, error } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortableField>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((campaign) =>
        campaign.title.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((campaign) => campaign.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return filtered;
  }, [campaigns, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortableField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (campaign: Campaign) => {
    cbModal({
      component: (props: { closeModal: () => void }) => (
        <div className={styles.modal}>
          <ModalHeader title="Delete Campaign" closeModal={props.closeModal} />
          <ModalBody>
            <p>
              Are you sure you want to delete <strong>{campaign.title}</strong>? This action
              cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button buttonType="light" onClick={props.closeModal}>
                Cancel
              </Button>
              <Button
                buttonType="delete"
                onClick={async () => {
                  setIsDeleting(campaign.uid);
                  try {
                    await deleteCampaign(campaign.uid);
                  } finally {
                    setIsDeleting(null);
                  }
                  props.closeModal();
                }}
              >
                Delete
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </div>
      ),
      modalProps: { size: 'small' },
    });
  };

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    ...ALL_CAMPAIGN_STATUSES.map((status) => ({
      label: CAMPAIGN_STATUS_LABELS[status],
      value: status,
    })),
  ];

  const getSortIcon = (field: SortableField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 'SortAscending' : 'SortDescending';
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <Icon icon="Warning" size="large" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Search
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(value: string) => setSearchQuery(value)}
            width="300px"
          />
          <Dropdown
            list={statusOptions}
            type="select"
            onChange={(selected: { value: string }) =>
              setStatusFilter(selected.value as CampaignStatus | 'all')
            }
            dropDownType="primary"
          >
            <Button buttonType="secondary" icon="Filter">
              {statusFilter === 'all'
                ? 'All Statuses'
                : CAMPAIGN_STATUS_LABELS[statusFilter]}
            </Button>
          </Dropdown>
        </div>
        {onWizard && (
          <Button buttonType="secondary" onClick={onWizard}>
            <span style={{ marginRight: '6px' }}>🪄</span>
            Campaign Wizard
          </Button>
        )}
        <Button buttonType="primary" icon="Add" onClick={onCreate}>
          New Campaign
        </Button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} className={styles.sortable}>
                Campaign Title
                {getSortIcon('title') && <Icon icon={getSortIcon('title')!} size="small" />}
              </th>
              <th onClick={() => handleSort('status')} className={styles.sortable}>
                Status
                {getSortIcon('status') && <Icon icon={getSortIcon('status')!} size="small" />}
              </th>
              <th>Channels</th>
              <th>Milestones</th>
              <th>Budget</th>
              <th onClick={() => handleSort('start_date')} className={styles.sortable}>
                Start Date
                {getSortIcon('start_date') && (
                  <Icon icon={getSortIcon('start_date')!} size="small" />
                )}
              </th>
              <th onClick={() => handleSort('end_date')} className={styles.sortable}>
                End Date
                {getSortIcon('end_date') && <Icon icon={getSortIcon('end_date')!} size="small" />}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  <div className={styles.emptyContent}>
                    <Icon icon="Folder" size="large" />
                    <p>No campaigns found</p>
                    {searchQuery || statusFilter !== 'all' ? (
                      <Button
                        buttonType="light"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : (
                      <Button buttonType="primary" onClick={onCreate}>
                        Create your first campaign
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((campaign) => (
                <tr key={campaign.uid}>
                  <td>
                    <div className={styles.campaignName}>
                      {onView ? (
                        <button
                          className={styles.campaignNameLink}
                          onClick={() => onView(campaign)}
                        >
                          {campaign.title}
                        </button>
                      ) : (
                        <strong>{campaign.title}</strong>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(campaign.status) }}
                    >
                      {CAMPAIGN_STATUS_LABELS[campaign.status]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.channels}>
                      {campaign.channels.map((channel) => (
                        <Tooltip key={channel} content={CAMPAIGN_CHANNEL_LABELS[channel]} position="top">
                          <span className={styles.channel}>
                            {channel === 'Native Mobile' ? 'MOBILE' : channel.toUpperCase()}
                          </span>
                        </Tooltip>
                      ))}
                    </div>
                  </td>
                  <td>
                    {campaign.timeline && campaign.timeline.length > 0 ? (
                      <Tooltip
                        content={campaign.timeline.map((m) => m.milestone_name).join(', ')}
                        position="top"
                      >
                        <span className={styles.milestones}>
                          <Icon icon="Calendar" size="small" />
                          {campaign.timeline.length}
                        </span>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{campaign.budget || '-'}</td>
                  <td>{formatDate(campaign.start_date)}</td>
                  <td>{formatDate(campaign.end_date)}</td>
                  <td>
                    <div className={styles.actions}>
                      <Tooltip content="Edit" position="top">
                        <Button
                          buttonType="tertiary"
                          icon="Edit"
                          onClick={() => onEdit(campaign)}
                          disabled={isDeleting === campaign.uid}
                        />
                      </Tooltip>
                      <Tooltip content="Delete" position="top">
                        <Button
                          buttonType="tertiary"
                          icon="Delete"
                          onClick={() => handleDelete(campaign)}
                          disabled={isDeleting === campaign.uid}
                        />
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <span>
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </span>
      </div>
    </div>
  );
}
