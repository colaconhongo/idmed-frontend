<template>
  <div ref="filterMmiaSection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Mapa Mensal de
      Informação de ARV (MMIA)
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}: Mapa
      Mensal de Informação de ARV (MMIA)
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
          <FiltersInput
            :id="id"
            :totalRecords="totalRecords"
            :qtyProcessed="qtyProcessed"
            :reportType="reportType"
            :progress="progress"
            :tabName="name"
            :params="params"
            :typeService="selectedService"
            :clinicalService="selectedService"
            :applicablePeriods="periodType"
            @generateReport="generateReport"
            @initReportProcessing="initReportProcessing"
          />
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup>
import Report from 'src/services/api/report/ReportService';
import { ref, provide } from 'vue';
import { LocalStorage } from 'quasar';
import mmiaReport from 'src/services/reports/ClinicManagement/Mmia.ts';

import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import MmiaMobileService from 'src/services/api/report/mobile/MmiaMobileService';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);
const name = 'Mmia';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const filterMmiaSection = ref('');
const downloadingPdf = ref(false);
const downloadingXls = ref(false);
const reportType = 'MAPA_MENSAL_DE_INFORMACAO_ARV';
const periodType = { id: 2, description: 'Mensal', code: 'MONTH' };
const isReportClosed = ref(false);
const alert = ref({
  type: '',
  visible: false,
  msg: '',
});

const progress = ref(0.0);
const closeSection = (params) => {
  filterMmiaSection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  } else {
    isReportClosed.value = true;
    LocalStorage.remove(props.id);
  }
};

const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const initReportProcessing = async (params) => {
  if (params.periodType !== 'MONTH') {
    alertError(
      'O período seleccionado não é aplicavel a este relatório, por favor seleccionar o período [Mensal]'
    );
  } else {
    progress.value = 0.001;
    if (isOnline.value) {
      updateParamsOnLocalStrage(params, isReportClosed);
      Report.apiInitMmiaProcessing(params).then((resp) => {
        getProcessingStatus(params);
      });
    } else {
      updateParamsOnLocalStrage(params, isReportClosed);
      const reportParams = await MmiaMobileService.getMmiaStockReport(params);
      const listRegimenSubReport =
        await MmiaMobileService.getMmiaRegimenSubReport(reportParams);
      const beta = await MmiaMobileService.getMmiaReport(
        reportParams,
        listRegimenSubReport
      );
      progress.value = 100;
      params.progress = 100;
    }
  }
};

const getProcessingStatus = (params) => {
  if (isOnline.value) {
    Report.getProcessingStatus('mmiaReport', params).then((resp) => {
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
        progress.value = 100;
        params.progress = 100;
        updateParamsOnLocalStrage(params, isReportClosed);
      }
    });
  }
};

const generateReport = (id, fileType) => {
  if (fileType === 'PDF') {
    mmiaReport.downloadPDF(id, downloadingPdf).then((resp) => {
      if (resp === 204) {
        alertError('Não existem Dados para o período selecionado');
        downloadingPdf.value = false;
      }
    });
  } else {
    mmiaReport.downloadExcel(id, downloadingXls).then((resp) => {
      if (resp === 204) {
        alertError('Não existem Dados para o período selecionado');
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
