<template>
  <div ref="filterDPatientHistorySection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Pacientes em
      Dispensa Semestral
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Pacientes em Dispensa Semestral
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
          <FiltersInput
            :id="id"
            :totalRecords="totalRecords"
            :qtyProcessed="qtyProcessed"
            :progress="progress"
            :reportType="report"
            :tabName="name"
            :params="params"
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
import { ref, provide } from 'vue';
import semiannualDispensationTS from 'src/services/reports/ClinicManagement/SemiannualDispensation.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PatientHistoryMobileService from 'src/services/api/report/mobile/PatientHistoryMobileService';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const name = 'SemiannualDispensation';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const progress = ref(0.0);
const filterDPatientHistorySection = ref('');
const report = 'PACIENTES_EM_DS';
const downloadingPdf = ref(false);
const downloadingXls = ref(false);
const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);

const isReportClosed = ref(false);
const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const closeSection = (params) => {
  filterDPatientHistorySection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  }
};

const initReportProcessing = (params) => {
  progress.value = 0.001;
  if (isOnline.value) {
    updateParamsOnLocalStrage(params, isReportClosed);
    Report.apiInitReportProcess('activePatientReport', params).then((resp) => {
      setTimeout(() => {
        getProcessingStatus(params);
      }, 3000);
    });
  } else {
    updateParamsOnLocalStrage(params, isReportClosed);
    PatientHistoryMobileService.getDataLocalDb(params);
    progress.value = 100;
    params.progress = 100;
  }
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('activePatientReport', params).then((resp) => {
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
  });
};

const generateReport = (id, fileType) => {
  //  UID da tab corrente
  if (isOnline.value) {
    Report.printReport('activePatientReport', id, fileType).then((resp) => {
      if (!resp.data[0]) {
        alertError('Não existem Dados para o período selecionado');
        downloadingXls.value = false;
        downloadingPdf.value = false;
      } else {
        const firstReg = resp.data[0];
        if (fileType === 'PDF') {
          downloadingPdf.value = true;
          semiannualDispensationTS.downloadPDF(
            firstReg.province,
            moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
            moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
            resp.data,
            'tarv'
          );
          downloadingPdf.value = false;
        } else {
          downloadingXls.value = true;
          semiannualDispensationTS.downloadExcel(
            firstReg.province,
            moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
            moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
            resp.data,
            'tarv'
          );
          downloadingXls.value = false;
        }
      }
    });
  } else {
    PatientHistoryMobileService.localDbGetAllByReportId(id).then((reports) => {
      const firstReg = reports[0];
      if (fileType === 'PDF') {
        semiannualDispensationTS.downloadPDF(
          '',
          moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
          moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
          reports
        );
        downloadingPdf.value = false;
      } else {
        semiannualDispensationTS.downloadExcel(
          '',
          moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
          moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
          reports
        );
        downloadingXls.value = false;
      }
    });
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
