<template>
  <div ref="filterExpectedSection">
    <ListHeader
      :addVisible="false"
      v-if="resultFromLocalStorage"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Pacientes
      Esperados Num Dia
    </ListHeader>
    <ListHeader
      :addVisible="false"
      v-else
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Pacientes Esperados Num Dia
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
          <FiltersInput
            :id="id"
            :reportType="report"
            :tabName="name"
            :params="params"
            :totalRecords="totalRecords"
            :progress="progress"
            :qtyProcessed="qtyProcessed"
            :clinicalService="selectedService"
            @generateReport="generateReport"
            @initReportProcessing="initReportProcessing"
          />
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup>
import moment from 'moment';
import Report from 'src/services/api/report/ReportService';
import { LocalStorage } from 'quasar';
import expectedOfTheDay from 'src/services/reports/Patients/ExpectedOfTheDay';
import { ref, provide, reactive } from 'vue';
import reportDatesParams from 'src/services/reports/ReportDatesParams';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import patientsExpectedInPharmacyMobileService from 'src/services/api/report/mobile/PatientsExpectedInPharmacyMobileService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();
const name = 'ExpectedPatients';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const progress = ref(0.0);
const filterExpectedSection = ref('');
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const report = 'EXPECTED_PATIENTS';
const downloadingPdf = reactive(ref(false));
const downloadingXls = ref(false);

const isReportClosed = ref(false);
const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const closeSection = (params) => {
  filterExpectedSection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  } else {
    isReportClosed.value = true;
    LocalStorage.remove(props.id);
  }
};

const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);

const initReportProcessing = (params) => {
  progress.value = 0.001;
  if (isOnline.value) {
    updateParamsOnLocalStrage(params, isReportClosed);
    const reportParams = reportDatesParams.determineStartEndDate(params);

    Report.apiInitExpectedPatientsProcessing(reportParams).then((resp) => {
      getProcessingStatus(reportParams);
    });
  } else {
    const reportParams = reportDatesParams.determineStartEndDate(params);
    patientsExpectedInPharmacyMobileService
      .getDataLocalDb(reportParams)
      .then((resp) => {
        progress.value = 100;
        params.progress = 100;
      });
    updateParamsOnLocalStrage(params, isReportClosed);
  }
};

const getProcessingStatus = (params) => {
  if (isOnline.value) {
    Report.getProcessingStatus('expectedPatientsReport', params).then(
      (resp) => {
        if (resp.data.progress > 0.001) {
          progress.value = resp.data.progress;
          if (progress.value < 100) {
            updateParamsOnLocalStrage(params, isReportClosed);
            params.progress = resp.data.progress;
            setTimeout(() => {
              getProcessingStatus(params);
            }, 3000);
          } else {
            progress.value = 100;
            params.progress = 100;
            updateParamsOnLocalStrage(params, isReportClosed);
          }
        } else {
          setTimeout(() => {
            getProcessingStatus(params);
          }, 3000);
        }
      }
    );
  }
};

const generateReport = async (id, fileType) => {
  if (isOnline.value) {
    Report.apiPrintExpectedPatientsReport(id).then((resp) => {
      if (!resp.data[0]) {
        alertError('Não existem Dados para o período selecionado');
        downloadingXls.value = false;
        downloadingPdf.value = false;
      } else {
        const patientAux = resp.data[0];

        if (fileType === 'PDF') {
          expectedOfTheDay.downloadPDF(
            patientAux.province,
            moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
            moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
            resp.data,
            downloadingPdf
          );
        } else {
          expectedOfTheDay.downloadExcel(
            patientAux.province,
            moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
            moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
            resp.data,
            downloadingXls
          );
        }
      }
    });
  } else {
    const data =
      await patientsExpectedInPharmacyMobileService.localDbGetAllByReportId(id);
    if (data.length === 0) {
      alertError('Não existem Dados para o período selecionado');
      downloadingXls.value = false;
      downloadingPdf.value = false;
    } else {
      const patientAux = data[0];

      if (fileType === 'PDF') {
        await expectedOfTheDay.downloadPDF(
          patientAux.province,
          moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
          moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
          data,
          downloadingPdf
        );
      } else {
        await expectedOfTheDay.downloadExcel(
          patientAux.province,
          moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
          moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
          data,
          downloadingXls
        );
      }
    }
  }
};

provide('downloadingPdf', downloadingPdf);
provide('downloadingXls', downloadingXls);
provide('serviceAux', serviceAux);
provide('resultFromLocalStorage', resultFromLocalStorage);
provide('getProcessingStatus', getProcessingStatus);
</script>

<style lang="scss" scoped>
.param-container {
  border-bottom: 1px dashed $grey-13;
  border-left: 1px dashed $grey-13;
  border-right: 1px dashed $grey-13;
  border-radius: 0px 0px 5px 5px;
}
</style>
