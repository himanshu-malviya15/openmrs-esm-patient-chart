import React, { useEffect, useMemo } from 'react';
import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import {
  changeWorkspaceContext,
  useAutoCreatedOfflineVisit,
  usePatientOrOfflineRegisteredPatient,
  useWorkspaceWindowSize,
} from '@openmrs/esm-patient-common-lib';
import ChartReview from '../patient-chart/chart-review/chart-review.component';
import ActionMenu from './action-menu/action-menu.component';
import Loader from '../loader/loader.component';
import WorkspaceNotification from '../workspace/workspace-notification.component';
import styles from './patient-chart.scss';
import { ChartConfig } from '../config-schema';

const PatientChart: React.FC = () => {
  const { patientUuid, view: encodedView } = useParams();
  const view = decodeURIComponent(encodedView);
  const { isLoading: isLoadingPatient, patient } = usePatientOrOfflineRegisteredPatient(patientUuid);
  const { windowSize, active } = useWorkspaceWindowSize();
  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);
  const { offlineVisitTypeUuid } = useConfig();
  const config = useConfig() as ChartConfig;

  // We are responsible for creating a new offline visit while in offline mode.
  // The patient chart widgets assume that this is handled by the chart itself.
  // We are also the module that holds the offline visit type UUID config.
  // The following hook takes care of the creation.
  useAutoCreatedOfflineVisit(patientUuid, offlineVisitTypeUuid);

  useEffect(() => {
    changeWorkspaceContext(patientUuid);
  }, [patientUuid]);

  return (
    <main className={`omrs-main-content ${styles.chartContainer}`}>
      {isLoadingPatient ? (
        <Loader />
      ) : (
        <>
          <div
            className={`${styles.innerChartContainer} ${
              windowSize.size === 'normal' && active ? styles.closeWorkspace : styles.activeWorkspace
            }`}
          >
            <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
            <aside>
              <ExtensionSlot extensionSlotName="patient-header-slot" state={state} />
              {config.showServiceQueueFields && (
                <ExtensionSlot extensionSlotName="transition-queue-entry-slot" state={state} />
              )}
              <ExtensionSlot extensionSlotName="patient-info-slot" state={state} />
            </aside>
            <div className={styles.grid}>
              <div className={styles.chartReview}>
                <ChartReview {...state} view={view} />
                <WorkspaceNotification />
              </div>
            </div>
          </div>
          <ActionMenu open={false} />
        </>
      )}
    </main>
  );
};

export default PatientChart;
