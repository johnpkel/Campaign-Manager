import React, { useState, useMemo } from 'react';
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
import { useCampaigns } from '../contexts';
import {
  Campaign,
  CampaignStatus,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_CHANNEL_LABELS,
} from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../utils';
import styles from './CampaignList.module.css';

interface CampaignListProps {
  onEdit: (campaign: Campaign) => void;
  onCreate: () => void;
}

export function CampaignList({ onEdit, onCreate }: CampaignListProps) {
  const { campaigns, deleteCampaign } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Campaign>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query) ||
          campaign.owner.toLowerCase().includes(query) ||
          campaign.tags.some((tag) => tag.toLowerCase().includes(query))
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

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [campaigns, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Campaign) => {
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
              Are you sure you want to delete <strong>{campaign.name}</strong>? This action
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
                onClick={() => {
                  deleteCampaign(campaign.id);
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
    ...Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => ({
      label,
      value,
    })),
  ];

  const getSortIcon = (field: keyof Campaign) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 'SortAscending' : 'SortDescending';
  };

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
        <Button buttonType="primary" icon="Add" onClick={onCreate}>
          New Campaign
        </Button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className={styles.sortable}>
                Campaign Name
                {getSortIcon('name') && <Icon icon={getSortIcon('name')!} size="small" />}
              </th>
              <th onClick={() => handleSort('status')} className={styles.sortable}>
                Status
                {getSortIcon('status') && <Icon icon={getSortIcon('status')!} size="small" />}
              </th>
              <th>Channels</th>
              <th onClick={() => handleSort('budget')} className={styles.sortable}>
                Budget
                {getSortIcon('budget') && <Icon icon={getSortIcon('budget')!} size="small" />}
              </th>
              <th onClick={() => handleSort('spent')} className={styles.sortable}>
                Spent
                {getSortIcon('spent') && <Icon icon={getSortIcon('spent')!} size="small" />}
              </th>
              <th onClick={() => handleSort('startDate')} className={styles.sortable}>
                Start Date
                {getSortIcon('startDate') && (
                  <Icon icon={getSortIcon('startDate')!} size="small" />
                )}
              </th>
              <th onClick={() => handleSort('endDate')} className={styles.sortable}>
                End Date
                {getSortIcon('endDate') && <Icon icon={getSortIcon('endDate')!} size="small" />}
              </th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.emptyState}>
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
                <tr key={campaign.id}>
                  <td>
                    <div className={styles.campaignName}>
                      <strong>{campaign.name}</strong>
                      <span className={styles.description}>{campaign.description}</span>
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
                        <Tooltip key={channel} content={CAMPAIGN_CHANNEL_LABELS[channel]}>
                          <span className={styles.channel}>{channel.toUpperCase()}</span>
                        </Tooltip>
                      ))}
                    </div>
                  </td>
                  <td>{formatCurrency(campaign.budget)}</td>
                  <td>
                    <div className={styles.spent}>
                      {formatCurrency(campaign.spent)}
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progress}
                          style={{
                            width: `${Math.min(
                              (campaign.spent / campaign.budget) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(campaign.startDate)}</td>
                  <td>{formatDate(campaign.endDate)}</td>
                  <td>{campaign.owner}</td>
                  <td>
                    <div className={styles.actions}>
                      <Tooltip content="Edit">
                        <Button
                          buttonType="tertiary"
                          icon="Edit"
                          onClick={() => onEdit(campaign)}
                        />
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Button
                          buttonType="tertiary"
                          icon="Delete"
                          onClick={() => handleDelete(campaign)}
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
