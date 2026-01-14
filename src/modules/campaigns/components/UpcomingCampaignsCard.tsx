import { useMemo, useState } from 'react';
import { Icon } from '@contentstack/venus-components';
import { useCampaigns } from '../../../contexts';
import { Campaign } from '../types';
import styles from './UpcomingCampaignsCard.module.css';

type ViewMode = 'list' | 'calendar';

interface CampaignProgress {
  campaign: Campaign;
  daysUntilLaunch: number;
  completionPercentage: number;
  status: 'on-track' | 'at-risk' | 'behind';
  tasksCompleted: number;
  totalTasks: number;
}

// Calculate mock progress for a campaign based on time until launch
function calculateCampaignProgress(campaign: Campaign): CampaignProgress {
  const now = new Date();
  const startDate = new Date(campaign.start_date);
  const createdDate = new Date(campaign.created_at);

  const daysUntilLaunch = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrepTime = Math.ceil((startDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(0, totalPrepTime - daysUntilLaunch);

  // Expected progress based on time
  const expectedProgress = totalPrepTime > 0 ? (daysPassed / totalPrepTime) * 100 : 0;

  // Simulate actual progress (mock data)
  // In reality, this would be calculated from actual task completion
  const baseProgress = Math.min(95, expectedProgress + (Math.random() * 20 - 10));

  // Calculate tasks (mock)
  const totalTasks = 8 + Math.floor(Math.random() * 5);
  const tasksCompleted = Math.floor((baseProgress / 100) * totalTasks);
  const completionPercentage = Math.round((tasksCompleted / totalTasks) * 100);

  // Determine status based on progress vs expected
  let status: 'on-track' | 'at-risk' | 'behind';
  const progressDiff = completionPercentage - expectedProgress;

  if (progressDiff >= -5) {
    status = 'on-track';
  } else if (progressDiff >= -20) {
    status = 'at-risk';
  } else {
    status = 'behind';
  }

  // Override status if very close to launch with low completion
  if (daysUntilLaunch <= 7 && completionPercentage < 80) {
    status = 'behind';
  } else if (daysUntilLaunch <= 14 && completionPercentage < 60) {
    status = 'at-risk';
  }

  return {
    campaign,
    daysUntilLaunch,
    completionPercentage,
    status,
    tasksCompleted,
    totalTasks,
  };
}

function formatLaunchDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 14) return 'Next week';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_CONFIG = {
  'on-track': {
    label: 'On Track',
    color: '#10b981',
    bgColor: '#ecfdf5',
    icon: 'CheckCircle',
  },
  'at-risk': {
    label: 'At Risk',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    icon: 'Warning',
  },
  'behind': {
    label: 'Behind',
    color: '#ef4444',
    bgColor: '#fef2f2',
    icon: 'Error',
  },
};

// Calendar helper functions
function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add padding days from previous month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  // Add all days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add padding days from next month to complete the grid
  const endPadding = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return d >= start && d <= end;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function UpcomingCampaignsCard() {
  const { campaigns, isLoading } = useCampaigns();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const upcomingCampaigns = useMemo(() => {
    const now = new Date();

    // Filter campaigns that are upcoming (not yet started or in preparation)
    return campaigns
      .filter(c => {
        const startDate = new Date(c.start_date);
        // Include campaigns that haven't started yet, or are paused/draft
        return startDate > now || c.status === 'paused';
      })
      .map(calculateCampaignProgress)
      .sort((a, b) => a.daysUntilLaunch - b.daysUntilLaunch);
  }, [campaigns]);

  // Get all campaigns for calendar view (not just upcoming)
  const allCampaignsWithProgress = useMemo(() => {
    return campaigns.map(calculateCampaignProgress);
  }, [campaigns]);

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCalendarDate(new Date());
  };

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    return getMonthDays(calendarDate.getFullYear(), calendarDate.getMonth());
  }, [calendarDate]);

  // Get campaigns for a specific day
  const getCampaignsForDay = (date: Date) => {
    return allCampaignsWithProgress.filter(({ campaign }) => {
      const startDate = new Date(campaign.start_date);
      const endDate = new Date(campaign.end_date);
      return isDateInRange(date, startDate, endDate);
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading campaigns...</span>
      </div>
    );
  }

  // Summary counts
  const statusCounts = upcomingCampaigns.reduce(
    (acc, c) => {
      acc[c.status]++;
      return acc;
    },
    { 'on-track': 0, 'at-risk': 0, 'behind': 0 }
  );

  const today = new Date();

  return (
    <div className={styles.container}>
      {/* Summary Header */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{upcomingCampaigns.length}</span>
          <span className={styles.summaryLabel}>Upcoming</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'list' ? styles.toggleActive : ''}`}
              onClick={(e) => { e.stopPropagation(); setViewMode('list'); }}
              title="List view"
            >
              <Icon icon="Menu" />
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'calendar' ? styles.toggleActive : ''}`}
              onClick={(e) => { e.stopPropagation(); setViewMode('calendar'); }}
              title="Calendar view"
            >
              <Icon icon="Calendar" />
            </button>
          </div>
          <div className={styles.statusSummary}>
            <div className={styles.statusCount} style={{ color: STATUS_CONFIG['on-track'].color }}>
              <Icon icon="CheckCircle" className={styles.statusIcon} />
              <span>{statusCounts['on-track']}</span>
            </div>
            <div className={styles.statusCount} style={{ color: STATUS_CONFIG['at-risk'].color }}>
              <Icon icon="Warning" className={styles.statusIcon} />
              <span>{statusCounts['at-risk']}</span>
            </div>
            <div className={styles.statusCount} style={{ color: STATUS_CONFIG['behind'].color }}>
              <Icon icon="Error" className={styles.statusIcon} />
              <span>{statusCounts['behind']}</span>
            </div>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div onClick={(e) => e.stopPropagation()}>
          {upcomingCampaigns.length > 0 ? (
            <div className={styles.campaignList}>
              {upcomingCampaigns.map(({ campaign, daysUntilLaunch, completionPercentage, status, tasksCompleted, totalTasks }) => {
                const statusConfig = STATUS_CONFIG[status];

                return (
                  <div key={campaign.uid} className={styles.campaignCard}>
                    <div className={styles.campaignHeader}>
                      <div className={styles.campaignInfo}>
                        <h4 className={styles.campaignTitle}>{campaign.title}</h4>
                        <div className={styles.campaignMeta}>
                          <span className={styles.launchDate}>
                            <Icon icon="Calendar" className={styles.metaIcon} />
                            {formatLaunchDate(campaign.start_date)}
                          </span>
                          <span className={styles.taskCount}>
                            {tasksCompleted}/{totalTasks} tasks
                          </span>
                        </div>
                      </div>
                      <div
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color
                        }}
                      >
                        <Icon icon={statusConfig.icon} className={styles.statusBadgeIcon} />
                        {statusConfig.label}
                      </div>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Campaign Readiness</span>
                        <span className={styles.progressValue}>{completionPercentage}%</span>
                      </div>
                      <div className={styles.progressBarWrapper}>
                        <div
                          className={styles.progressBar}
                          style={{
                            width: `${completionPercentage}%`,
                            backgroundColor: statusConfig.color
                          }}
                        />
                        {/* Expected progress marker */}
                        <div
                          className={styles.expectedMarker}
                          style={{
                            left: `${Math.min(100, Math.max(0, 100 - (daysUntilLaunch / 30) * 100))}%`
                          }}
                          title="Expected progress"
                        />
                      </div>
                      <div className={styles.progressFooter}>
                        <span className={styles.daysRemaining}>
                          {daysUntilLaunch > 0
                            ? `${daysUntilLaunch} day${daysUntilLaunch !== 1 ? 's' : ''} until launch`
                            : 'Launch day!'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <Icon icon="Calendar" />
              <span>No upcoming campaigns</span>
              <span className={styles.emptySubtext}>All campaigns are currently active</span>
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className={styles.calendarContainer} onClick={(e) => e.stopPropagation()}>
          {/* Calendar Navigation */}
          <div className={styles.calendarNav}>
            <button className={styles.calendarNavButton} onClick={(e) => { e.stopPropagation(); goToPreviousMonth(); }}>
              <Icon icon="ChevronLeft" />
            </button>
            <div className={styles.calendarTitle}>
              <span className={styles.calendarMonth}>
                {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </span>
              <button className={styles.todayButton} onClick={(e) => { e.stopPropagation(); goToToday(); }}>
                Today
              </button>
            </div>
            <button className={styles.calendarNavButton} onClick={(e) => { e.stopPropagation(); goToNextMonth(); }}>
              <Icon icon="ChevronRight" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className={styles.calendarGrid}>
            {/* Day Headers */}
            {DAY_NAMES.map(day => (
              <div key={day} className={styles.calendarDayHeader}>
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
              const isToday = isSameDay(date, today);
              const dayCampaigns = getCampaignsForDay(date);

              return (
                <div
                  key={index}
                  className={`${styles.calendarDay} ${!isCurrentMonth ? styles.calendarDayOutside : ''} ${isToday ? styles.calendarDayToday : ''}`}
                >
                  <span className={styles.calendarDayNumber}>{date.getDate()}</span>
                  {dayCampaigns.length > 0 && (
                    <div className={styles.calendarCampaigns}>
                      {dayCampaigns.slice(0, 2).map(({ campaign, status }) => {
                        const statusConfig = STATUS_CONFIG[status];
                        const isStart = isSameDay(date, new Date(campaign.start_date));
                        const isEnd = isSameDay(date, new Date(campaign.end_date));

                        return (
                          <div
                            key={campaign.uid}
                            className={`${styles.calendarCampaignBar} ${isStart ? styles.calendarCampaignStart : ''} ${isEnd ? styles.calendarCampaignEnd : ''}`}
                            style={{ backgroundColor: statusConfig.color }}
                            title={`${campaign.title} (${statusConfig.label})`}
                          >
                            {isStart && (
                              <span className={styles.calendarCampaignLabel}>
                                {campaign.title}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {dayCampaigns.length > 2 && (
                        <span className={styles.calendarMore}>
                          +{dayCampaigns.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className={styles.calendarLegend}>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: config.color }} />
                <span className={styles.legendLabel}>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
