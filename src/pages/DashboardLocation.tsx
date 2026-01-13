import React from 'react';
import { DashboardWidget } from '../components';
import styles from './DashboardLocation.module.css';

export function DashboardLocation() {
  return (
    <div className={styles.container}>
      <DashboardWidget />
    </div>
  );
}
