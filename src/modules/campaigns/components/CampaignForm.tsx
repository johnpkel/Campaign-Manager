import React, { useState, useEffect } from 'react';
import {
  Button,
  TextInput,
  Textarea,
  Select,
  DatePicker,
  Checkbox,
  ButtonGroup,
  Field,
  FieldLabel,
  Help,
  InstructionText,
  Icon,
} from '@contentstack/venus-components';
import {
  Campaign,
  CampaignFormData,
  CampaignStatus,
  CampaignChannel,
  RTEContent,
  TimelineMilestone,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_CHANNEL_LABELS,
  ALL_CAMPAIGN_CHANNELS,
} from '../types';
import styles from './CampaignForm.module.css';

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSubmit: (data: CampaignFormData) => void;
  onCancel: () => void;
}

// Helper to extract plain text from RTE content
function getRTEPlainText(rte?: RTEContent): string {
  if (!rte || !rte.children) return '';
  const extractText = (nodes: any[]): string => {
    return nodes
      .map((node) => {
        if (node.text) return node.text;
        if (node.children) return extractText(node.children);
        return '';
      })
      .join('');
  };
  return extractText(rte.children);
}

// Helper to create RTE content from plain text
function createRTEFromText(text: string): RTEContent | undefined {
  if (!text.trim()) return undefined;
  return {
    type: 'doc',
    uid: `rte_${Math.random().toString(36).slice(2, 9)}`,
    children: [
      {
        type: 'p',
        uid: `p_${Math.random().toString(36).slice(2, 9)}`,
        children: [{ type: 'text', text }],
      },
    ],
  };
}

const INITIAL_FORM_DATA: CampaignFormData = {
  title: '',
  key_messages: undefined,
  campaign_goals: undefined,
  status: 'active',
  channels: [],
  start_date: '',
  end_date: '',
  budget: '',
  contributors: [],
  assets: [],
  timeline: [],
  market_research: undefined,
  brand_kit: [],
  voice_profile: [],
  audiences: [],
  releases: [],
  entries: [],
};

export function CampaignForm({ campaign, onSubmit, onCancel }: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>(INITIAL_FORM_DATA);
  const [keyMessagesText, setKeyMessagesText] = useState('');
  const [campaignGoalsText, setCampaignGoalsText] = useState('');
  const [marketResearchText, setMarketResearchText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(campaign);

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        key_messages: campaign.key_messages,
        campaign_goals: campaign.campaign_goals,
        status: campaign.status,
        channels: campaign.channels,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        budget: campaign.budget || '',
        contributors: campaign.contributors || [],
        assets: campaign.assets || [],
        timeline: campaign.timeline || [],
        market_research: campaign.market_research,
        brand_kit: campaign.brand_kit || [],
        voice_profile: campaign.voice_profile || [],
        audiences: campaign.audiences || [],
        releases: campaign.releases || [],
        entries: campaign.entries || [],
      });
      setKeyMessagesText(getRTEPlainText(campaign.key_messages));
      setCampaignGoalsText(getRTEPlainText(campaign.campaign_goals));
      setMarketResearchText(getRTEPlainText(campaign.market_research));
    }
  }, [campaign]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    }

    if (formData.channels.length === 0) {
      newErrors.channels = 'At least one channel is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert text fields to RTE before submitting
    const submitData: CampaignFormData = {
      ...formData,
      key_messages: createRTEFromText(keyMessagesText),
      campaign_goals: createRTEFromText(campaignGoalsText),
      market_research: createRTEFromText(marketResearchText),
    };

    if (validate()) {
      onSubmit(submitData);
    }
  };

  const handleChannelToggle = (channel: CampaignChannel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleAddMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      timeline: [...(prev.timeline || []), { milestone_name: '', milestone_date: '' }],
    }));
  };

  const handleUpdateMilestone = (index: number, field: keyof TimelineMilestone, value: string) => {
    setFormData((prev) => ({
      ...prev,
      timeline: (prev.timeline || []).map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleRemoveMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timeline: (prev.timeline || []).filter((_, i) => i !== index),
    }));
  };

  const statusOptions = Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2>{isEditing ? 'Edit Campaign' : 'Create Campaign'}</h2>
        <p>
          {isEditing
            ? 'Update your campaign details below'
            : 'Fill in the details to create a new marketing campaign'}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3>Basic Information</h3>

          <Field>
            <FieldLabel htmlFor="title" required>
              Campaign Title
            </FieldLabel>
            <TextInput
              id="title"
              name="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter campaign title"
              error={Boolean(errors.title)}
            />
            {errors.title && <Help text={errors.title} type="error" />}
          </Field>

          <Field>
            <FieldLabel htmlFor="key_messages">
              Key Messages / Themes
            </FieldLabel>
            <Textarea
              id="key_messages"
              name="key_messages"
              value={keyMessagesText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setKeyMessagesText(e.target.value)
              }
              placeholder="Enter the key messages and themes for this campaign"
              rows={3}
            />
            <InstructionText>What are the main messages you want to communicate?</InstructionText>
          </Field>

          <Field>
            <FieldLabel htmlFor="campaign_goals">
              Campaign Goals
            </FieldLabel>
            <Textarea
              id="campaign_goals"
              name="campaign_goals"
              value={campaignGoalsText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCampaignGoalsText(e.target.value)
              }
              placeholder="Define the campaign objectives and goals"
              rows={3}
            />
            <InstructionText>What are you trying to achieve with this campaign?</InstructionText>
          </Field>

          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select
              options={statusOptions}
              value={statusOptions.find((opt) => opt.value === formData.status)}
              onChange={(option: { value: CampaignStatus }) =>
                setFormData((prev) => ({ ...prev, status: option.value }))
              }
              placeholder="Select status"
            />
          </Field>
        </div>

        <div className={styles.section}>
          <h3>Channels</h3>
          <InstructionText>Select the channels this campaign will use</InstructionText>
          {errors.channels && (
            <Help text={errors.channels} type="error" />
          )}
          <div className={styles.channels}>
            {ALL_CAMPAIGN_CHANNELS.map((channel) => (
              <Checkbox
                key={channel}
                id={`channel-${channel}`}
                label={CAMPAIGN_CHANNEL_LABELS[channel]}
                checked={formData.channels.includes(channel)}
                onChange={() => handleChannelToggle(channel)}
              />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3>Schedule & Budget</h3>

          <div className={styles.row}>
            <Field className={styles.halfWidth}>
              <FieldLabel htmlFor="start_date" required>
                Start Date
              </FieldLabel>
              <DatePicker
                id="start_date"
                value={formData.start_date ? new Date(formData.start_date) : null}
                onChange={(date: Date | null) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: date ? date.toISOString().split('T')[0] : '',
                  }))
                }
                placeholder="Select start date"
              />
              {errors.start_date && <Help text={errors.start_date} type="error" />}
            </Field>

            <Field className={styles.halfWidth}>
              <FieldLabel htmlFor="end_date" required>
                End Date
              </FieldLabel>
              <DatePicker
                id="end_date"
                value={formData.end_date ? new Date(formData.end_date) : null}
                onChange={(date: Date | null) =>
                  setFormData((prev) => ({
                    ...prev,
                    end_date: date ? date.toISOString().split('T')[0] : '',
                  }))
                }
                placeholder="Select end date"
              />
              {errors.end_date && <Help text={errors.end_date} type="error" />}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="budget">
              Budget
            </FieldLabel>
            <TextInput
              id="budget"
              name="budget"
              value={formData.budget || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  budget: e.target.value,
                }))
              }
              placeholder="e.g., $50,000 or 50000 USD"
            />
            <InstructionText>Enter the campaign budget in your preferred format</InstructionText>
          </Field>
        </div>

        <div className={styles.section}>
          <h3>Contributors</h3>
          <div className={styles.placeholder}>
            <InstructionText>
              Contributors field will be available in a future update.
              This will allow you to select team members working on this campaign.
            </InstructionText>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Assets</h3>
          <div className={styles.placeholder}>
            <InstructionText>
              Asset upload will be available in a future update.
              This will allow you to attach media files to your campaign.
            </InstructionText>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Timeline</h3>
          <InstructionText>Add campaign milestones to track key dates</InstructionText>
          <div className={styles.milestones}>
            {(formData.timeline || []).map((milestone, index) => (
              <div key={index} className={styles.milestoneRow}>
                <div className={styles.milestoneFields}>
                  <Field className={styles.milestoneName}>
                    <TextInput
                      value={milestone.milestone_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUpdateMilestone(index, 'milestone_name', e.target.value)
                      }
                      placeholder="Milestone name"
                    />
                  </Field>
                  <Field className={styles.milestoneDate}>
                    <DatePicker
                      value={milestone.milestone_date ? new Date(milestone.milestone_date) : null}
                      onChange={(date: Date | null) =>
                        handleUpdateMilestone(
                          index,
                          'milestone_date',
                          date ? date.toISOString().split('T')[0] : ''
                        )
                      }
                      placeholder="Select date"
                    />
                  </Field>
                  <button
                    type="button"
                    className={styles.removeMilestone}
                    onClick={() => handleRemoveMilestone(index)}
                    aria-label="Remove milestone"
                  >
                    <Icon icon="Delete" size="small" />
                  </button>
                </div>
              </div>
            ))}
            <Button
              buttonType="tertiary"
              onClick={handleAddMilestone}
              type="button"
              icon="Plus"
            >
              Add Milestone
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Market Research</h3>
          <Field>
            <FieldLabel htmlFor="market_research">Research Notes & URLs</FieldLabel>
            <Textarea
              id="market_research"
              name="market_research"
              value={marketResearchText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMarketResearchText(e.target.value)
              }
              placeholder="Add market research notes, competitor analysis, and relevant URLs"
              rows={4}
            />
            <InstructionText>Document relevant market research and reference materials</InstructionText>
          </Field>
        </div>

        <div className={styles.section}>
          <h3>Brand Kit</h3>
          <div className={styles.placeholder}>
            <InstructionText>
              Brand Kit integration will be available in a future update.
              This will allow you to link brand guidelines and voice profiles.
            </InstructionText>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Audiences</h3>
          <div className={styles.placeholder}>
            <InstructionText>
              Lytics Audiences integration will be available in a future update.
              This will allow you to target specific audience segments.
            </InstructionText>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Contentstack Integration</h3>
          <div className={styles.placeholder}>
            <InstructionText>
              Contentstack Releases and Entries integration will be available in a future update.
              This will allow you to link releases and content entries to your campaigns.
            </InstructionText>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <ButtonGroup>
          <Button buttonType="light" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button buttonType="primary" type="submit">
            {isEditing ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </ButtonGroup>
      </div>
    </form>
  );
}
