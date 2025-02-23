<template>
  <div>
    <InfoTitleBar v-if="!website" />
    <TitleBar v-else />
    <div class="row q-mt-md" v-if="patient !== null">
      <q-drawer
        v-model="showPatientInfo"
        :width="405"
        :breakpoint="500"
        overlay
        bordered
        behavior="mobile"
        class="bg-grey-1 q-pl-md q-py-md"
        v-if="!website"
      >
        <q-scroll-area
          :thumb-style="thumbStyle"
          :content-style="contentStyle"
          :content-active-style="contentActiveStyle"
          style="height: 690px"
          class="q-pr-md"
        >
          <PatientInfo />
        </q-scroll-area>
      </q-drawer>
      <div
        v-else
        class="col-3 q-pa-md q-pl-lg q-ml-sm panel"
        style="max-width: 390px"
      >
        <PatientInfo />
      </div>
      <div class="col q-mx-lg">
        <q-toolbar
          v-if="!website"
          class="bg-primary text-white q-mb-sm rounded-borders"
        >
          <div class="col text-center">
            <q-tabs v-model="tab" shrink>
              <q-tab name="clinicService" label="Serviços de Saúde" />
              <q-tab name="prescription" label="Prescrição" />
              <q-tab name="screening" label="Atenção Farmacêutica" />
            </q-tabs>
          </div>
        </q-toolbar>
        <div class="" v-if="!website">
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="clinicService">
              <q-scroll-area
                :thumb-style="thumbStyle"
                :content-style="contentStyle"
                :content-active-style="contentActiveStyle"
                style="height: 440px"
                class="q-pr-md"
              >
                <ClinicServiceInfo class="q-mb-lg" />
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="prescription">
              <q-scroll-area
                :thumb-style="thumbStyle"
                :content-style="contentStyle"
                :content-active-style="contentActiveStyle"
                style="height: 440px"
                class="q-pr-md"
              >
                <PrescriptionInfo class="q-mb-lg" />
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="screening">
              <q-scroll-area
                :thumb-style="thumbStyle"
                :content-style="contentStyle"
                :content-active-style="contentActiveStyle"
                style="height: 440px"
                class="q-pr-md"
              >
                <PharmaceuticalAtentionInfo />
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div>
        <q-scroll-area
          :thumb-style="thumbStyle"
          :content-style="contentStyle"
          :content-active-style="contentActiveStyle"
          style="height: 730px"
          class="q-pr-md"
          v-if="website"
        >
          <ClinicServiceInfo v-if="website" class="q-mb-lg" />
          <PrescriptionInfo v-if="website" class="q-mb-lg" />
          <PharmaceuticalAtentionInfo v-if="website" />
        </q-scroll-area>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, provide, ref } from 'vue';
import patientService from 'src/services/api/patientService/patientService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import TitleBar from 'src/components/Shared/TitleBar.vue';
import InfoTitleBar from 'components/Patient/PatientPanel/PanelTitleBar.vue';
import PatientInfo from 'components/Patient/PatientPanel/PatientInfo.vue';
import ClinicServiceInfo from 'components/Patient/PatientPanel/ClinicServicesInfo.vue';
import PrescriptionInfo from 'components/Patient/PatientPanel/PrescriptionInfo.vue';
import PharmaceuticalAtentionInfo from 'components/Patient/PatientPanel/PharmaceuticalAtentionInfo.vue';
import { useLoading } from 'src/composables/shared/loading/loading';

//Declarations
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isMobile } = useSystemUtils();
const tab = ref('clinicService');

const showPatientInfo = ref(false);
const title = ref('Detalhe do Utente/Paciente');
const contentStyle = ref({
  backgroundColor: '#ffffff',
  color: '#555',
});

const contentActiveStyle = ref({
  backgroundColor: '#eee',
  color: 'black',
});
const thumbStyle = ref({
  right: '2px',
  borderRadius: '5px',
  backgroundColor: '#0ba58b',
  width: '5px',
  opacity: 0.75,
});

// Hook
onMounted(() => {
  init();
});

// Methods
const init = async () => {
  showloading();
  // if (patient.value === null) {
  //   patient.value = patientService.getPatientByID(
  //     localStorage.getItem('patientuuid')
  //   );
  // }

  // else {
  //   if (isMobile.value && !isOnline.value) {
  //     await patientService.getPatientMobileWithAllByPatientId(patient.value);
  //   } else {
  //     // Rest Calls
  //     await patientServiceIdentifierService.apiGetAllByPatientId(
  //       patient.value.id
  //     );
  //     await patientVisitService.apiGetAllByPatientId(patient.value.id);
  //     await patientVisitDetailsService.apiGetPatientVisitDetailsByPatientId(
  //       currPatient.value.id
  //     );
  //     await prescriptionService.apiGetByPatientId(patient.value.id);
  //     await packService.apiGetByPatientId(patient.value.id);
  //   }
  // }
  closeLoading();
};
const showPatientDetails = () => {
  showPatientInfo.value = !showPatientInfo.value;
};

// Computed
const patient = computed(() => {
  return patientService.getPatientByID(localStorage.getItem('patientuuid'));
});

provide('title', title);
provide('patient', patient);
provide('website', website);
provide('showPatientDetails', showPatientDetails);
</script>

<style lang="scss">
.panel {
  border: 1px solid $grey-13;
  border-radius: 10px;
}
</style>
