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
} from '@contentstack/venus-components';
import {
  Campaign,
  CampaignFormData,
  CampaignStatus,
  CampaignChannel,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_CHANNEL_LABELS,
} from '../types';
import styles from './CampaignForm.module.css';

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSubmit: (data: CampaignFormData) => void;
  onCancel: () => void;
}

const INITIAL_FORM_DATA: CampaignFormData = {
  name: '',
  description: '',
  status: 'draft',
  channels: [],
  startDate: '',
  endDate: '',
  budget: 0,
  owner: '',
  tags: [],
};

export function CampaignForm({ campaign, onSubmit, onCancel }: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  const isEditing = Boolean(campaign);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        channels: campaign.channels,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budget: campaign.budget,
        owner: campaign.owner,
        tags: campaign.tags,
      });
    }
  }, [campaign]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.channels.length === 0) {
      newErrors.channels = 'At least one channel is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    if (!formData.owner.trim()) {
      newErrors.owner = 'Owner is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
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

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const statusOptions = Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  const channelOptions = Object.entries(CAMPAIGN_CHANNEL_LABELS) as [
    CampaignChannel,
    string
  ][];

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
            <FieldLabel htmlFor="name" required>
              Campaign Name
            </FieldLabel>
            <TextInput
              id="name"
              name="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter campaign name"
              error={Boolean(errors.name)}
            />
            {errors.name && <Help text={errors.name} type="error" />}
          </Field>

          <Field>
            <FieldLabel htmlFor="description" required>
              Description
            </FieldLabel>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe your campaign objectives and strategy"
              rows={3}
              error={Boolean(errors.description)}
            />
            {errors.description && <Help text={errors.description} type="error" />}
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

          <Field>
            <FieldLabel htmlFor="owner" required>
              Campaign Owner
            </FieldLabel>
            <TextInput
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, owner: e.target.value }))
              }
              placeholder="Enter owner name"
              error={Boolean(errors.owner)}
            />
            {errors.owner && <Help text={errors.owner} type="error" />}
          </Field>
        </div>

        <div className={styles.section}>
          <h3>Channels</h3>
          {errors.channels && (
            <Help text={errors.channels} type="error" />
          )}
          <div className={styles.channels}>
            {channelOptions.map(([channel, label]) => (
              <Checkbox
                key={channel}
                id={`channel-${channel}`}
                label={label}
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
              <FieldLabel htmlFor="startDate" required>
                Start Date
              </FieldLabel>
              <DatePicker
                id="startDate"
                value={formData.startDate ? new Date(formData.startDate) : null}
                onChange={(date: Date | null) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: date ? date.toISOString().split('T')[0] : '',
                  }))
                }
                placeholder="Select start date"
              />
              {errors.startDate && <Help text={errors.startDate} type="error" />}
            </Field>

            <Field className={styles.halfWidth}>
              <FieldLabel htmlFor="endDate" required>
                End Date
              </FieldLabel>
              <DatePicker
                id="endDate"
                value={formData.endDate ? new Date(formData.endDate) : null}
                onChange={(date: Date | null) =>
                  setFormData((prev) => ({
                    ...prev,
                    endDate: date ? date.toISOString().split('T')[0] : '',
                  }))
                }
                placeholder="Select end date"
              />
              {errors.endDate && <Help text={errors.endDate} type="error" />}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="budget" required>
              Budget (USD)
            </FieldLabel>
            <TextInput
              id="budget"
              name="budget"
              type="number"
              value={formData.budget.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  budget: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="Enter budget amount"
              error={Boolean(errors.budget)}
            />
            {errors.budget && <Help text={errors.budget} type="error" />}
          </Field>
        </div>

        <div className={styles.section}>
          <h3>Tags</h3>
          <div className={styles.tagInput}>
            <TextInput
              value={tagInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTagInput(e.target.value)
              }
              onKeyPress={handleKeyPress}
              placeholder="Add a tag and press Enter"
            />
            <Button buttonType="secondary" onClick={handleAddTag} type="button">
              Add
            </Button>
          </div>
          <div className={styles.tags}>
            {formData.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  className={styles.removeTag}
                  onClick={() => handleRemoveTag(tag)}
                >
                  &times;
                </button>
              </span>
            ))}
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
