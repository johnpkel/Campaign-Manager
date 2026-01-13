import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Select,
  Checkbox,
  ButtonGroup,
  Field,
  FieldLabel,
  InstructionText,
} from '@contentstack/venus-components';
import { useAppSdk } from '../contexts';
import { AppConfig as AppConfigType, DEFAULT_APP_CONFIG } from '../types';
import styles from './AppConfig.module.css';

export function AppConfig() {
  const { config, setConfig } = useAppSdk();
  const [formData, setFormData] = useState<AppConfigType>(config || DEFAULT_APP_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const currencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'JPY - Japanese Yen', value: 'JPY' },
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'AUD - Australian Dollar', value: 'AUD' },
  ];

  const dateFormatOptions = [
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
    { label: 'DD MMM YYYY', value: 'DD MMM YYYY' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await setConfig(formData);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_APP_CONFIG);
    setSaveMessage(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Campaign Manager Settings</h2>
        <p>Configure your campaign manager preferences</p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3>Display Settings</h3>

          <Field>
            <FieldLabel htmlFor="currency">Default Currency</FieldLabel>
            <InstructionText>
              Select the default currency for displaying budget amounts
            </InstructionText>
            <Select
              options={currencyOptions}
              value={currencyOptions.find((opt) => opt.value === formData.defaultCurrency)}
              onChange={(option: { value: string }) =>
                setFormData((prev) => ({ ...prev, defaultCurrency: option.value }))
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="dateFormat">Date Format</FieldLabel>
            <InstructionText>Choose how dates are displayed throughout the app</InstructionText>
            <Select
              options={dateFormatOptions}
              value={dateFormatOptions.find((opt) => opt.value === formData.dateFormat)}
              onChange={(option: { value: string }) =>
                setFormData((prev) => ({ ...prev, dateFormat: option.value }))
              }
            />
          </Field>
        </div>

        <div className={styles.section}>
          <h3>Defaults</h3>

          <Field>
            <FieldLabel htmlFor="defaultOwner">Default Campaign Owner</FieldLabel>
            <InstructionText>
              This name will be pre-filled when creating new campaigns
            </InstructionText>
            <TextInput
              id="defaultOwner"
              name="defaultOwner"
              value={formData.defaultOwner}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, defaultOwner: e.target.value }))
              }
              placeholder="Enter default owner name"
            />
          </Field>
        </div>

        <div className={styles.section}>
          <h3>Notifications</h3>

          <Field>
            <Checkbox
              id="enableNotifications"
              label="Enable notifications"
              checked={formData.enableNotifications}
              onChange={(checked: boolean) =>
                setFormData((prev) => ({ ...prev, enableNotifications: checked }))
              }
            />
            <InstructionText>
              Receive notifications for campaign status changes and milestones
            </InstructionText>
          </Field>
        </div>

        {saveMessage && (
          <div
            className={`${styles.message} ${
              saveMessage.type === 'success' ? styles.success : styles.error
            }`}
          >
            {saveMessage.text}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <ButtonGroup>
          <Button buttonType="light" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button buttonType="primary" onClick={handleSave} isLoading={isSaving}>
            Save Settings
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
