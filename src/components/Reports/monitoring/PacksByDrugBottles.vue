<template>
  <div ref="filterDrugStoreSection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Lista de
      Dispensas por Frascos
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}: Lista
      de Dispensas por Frascos
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
          <FiltersInput
            :id="id"
            :totalRecords="totalRecords"
            :qtyProcessed="qtyProcessed"
            :reportType="report"
            :tabName="name"
            :params="params"
            :progress="progress"
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
import Report from 'src/services/api/report/ReportService';
import { v4 as uuidv4 } from 'uuid';
import { LocalStorage } from 'quasar';
import { ref, onMounted, provide, reactive } from 'vue';
//compontes
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PacksByDrugBottles from 'src/services/reports/monitoring/PacksByDrugBottles';
import PacksByDrugBottleMobileService from 'src/services/api/report/mobile/PacksByDrugBottleMobileService';
const { alertError } = useSwal();

const name = 'PacksByDrugBottles';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const progress = ref(0.0);
const filterDrugStoreSection = ref('');
const report = 'PACKS_BY_BOTTLE';
const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);
const downloadingPdf = reactive(ref(false));
const downloadingXls = reactive(ref(false));

onMounted(() => {
  if (props.params) {
    // getProcessingStatus(props.params);
  }
});

const isReportClosed = ref(false);
const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const closeSection = (params) => {
  console.log(props.params);
  filterDrugStoreSection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  } else {
    isReportClosed.value = true;
    LocalStorage.remove(props.id);
  }
};

const initReportProcessing = (params) => {
  updateParamsOnLocalStrage(params, isReportClosed);
  PacksByDrugBottleMobileService.getDataLocalDb(params);
  progress.value = 100;
  params.progress = 100;
};

const getProcessingStatus = (params) => {
  progress.value = 100;
  params.progress = 100;
};

const generateReport = (id, fileType, params) => {
  if (fileType === 'PDF') {
    PacksByDrugBottles.downloadPDF(params, downloadingPdf).then((resp) => {
      if (resp === 204) {
        alertError('Não existem Dados para o período selecionado');
        downloadingPdf.value = false;
      }
    });
  } else {
    PacksByDrugBottles.downloadExcel(params, downloadingXls).then((resp) => {
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
