<template>
  <div>
    <div class="q-mb-md text-weight-bold text-subtitle1">
      <q-bar style="background-color: #9e9e9e2e">
        <div class="cursor-pointer non-selectable">Medicamentos</div>
      </q-bar>
      <q-separator class="q-my-md max-width" color="primary"></q-separator>
    </div>
    <div class="">
      <q-table
        :loading="loading"
        :rows="drugs"
        :columns="columns"
        :filter="filter"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <template v-slot:top-right>
          <div class="row q-gutter-sm">
            <q-input
              outlined
              dense
              debounce="300"
              v-model="filter"
              placeholder="Procurar"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-btn
              color="primary"
              icon-right="refresh"
              label="Actualizar Lista"
              no-caps
              v-if="isProvincialInstalation()"
              @click="getDrugsFromProvincialServer"
            />
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="packSize" :props="props">
              {{ props.row.packSize }}
            </q-td>
            <q-td key="defaultTimes" :props="props">
              {{ props.row.defaultTimes }}
            </q-td>
            <q-td key="defaultTreatment" :props="props">
              {{ props.row.defaultTreatment }}
            </q-td>
            <q-td key="defaultPeriodTreatment" :props="props">
              {{ props.row.defaultPeriodTreatment }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeDrug(props.row)"
                >
                  <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  :color="getColorActive(props.row)"
                  :icon="getIconActive(props.row)"
                  @click.stop="promptToConfirm(props.row)"
                >
                  <q-tooltip :class="getTooltipClass(props.row)">{{
                    props.row.active ? 'Inactivar' : 'Activar'
                  }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <q-dialog persistent v-model="showDrugRegistrationScreen">
      <addDrug @close="showDrugRegistrationScreen = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, provide, onMounted, computed } from 'vue';
import drugService from 'src/services/api/drugService/drugService.ts';
import formService from 'src/services/api/formService/formService.ts';

/*Components Import*/
import addDrug from 'src/components/Settings/Drug/AddDrug.vue';
import { useLoading } from 'src/composables/shared/loading/loading';

/*Declarations*/
const { alertWarningAction, alertSucess, alertError } = useSwal();
const { showloading, closeLoading } = useLoading();
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'packSize',
    required: true,
    label: 'Tamanho do Pacote',
    align: 'left',
    field: (row) => row.packSize,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'defaultTimes',
    required: true,
    label: 'Numero de toma',
    align: 'left',
    field: (row) => row.defaultTimes,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'defaultTreatment',
    required: true,
    label: 'Numero de Vezes a Tomar',
    align: 'left',
    field: (row) => row.defaultTreatment,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'defaultPeriodTreatment',
    required: true,
    label: 'Periodo a Tomar',
    align: 'left',
    field: (row) => (row) => row.defaultPeriodTreatment,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const showDrugRegistrationScreen = ref(false);
const drug = ref(drugService.newInstanceEntity());
const filter = ref('');

/*injects*/
const step = inject('step');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const loading = ref(true);

/*Hooks*/
const forms = computed(() => {
  return formService.getAllForms();
});

const drugs = computed(() => {
  const drugsRes = ref(null);
  drugsRes.value = drugService.getAllForAllDrugs();
  if (drugsRes.value && drugsRes.value.length >= 0) stopLoading();
  return drugsRes.value;
});

const stopLoading = () => {
  loading.value = false;
};

onMounted(() => {
  isEditStep.value = false;
  isCreateStep.value = false;
  step.value = '';
  editMode.value = false;
  viewMode.value = false;
});

/*Methods*/
const getIconActive = (drug) => {
  if (drug.active) {
    return 'stop_circle';
  } else if (!drug.active) {
    return 'play_circle';
  }
};
const getColorActive = (drug) => {
  if (drug.active) {
    return 'red';
  } else if (!drug.active) {
    return 'green';
  }
};
const getTooltipClass = (drug) => {
  if (drug.active) {
    return 'bg-red-5';
  } else if (!drug.active) {
    return 'bg-green-5';
  }
};
const visualizeDrug = (drugParam) => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCreateStep.value = false;
  isEditStep.value = false;
  drug.value = drugParam;
  viewMode.value = true;
  showDrugRegistrationScreen.value = true;
  editMode.value = false;
};

const getDrugsFromProvincialServer = () => {
  showloading();
  drugService
    .getFromProvincial(0)
    .then(() => {
      console.log('Inicio actualizacao da lista Drugs');
    })
    .catch((error) => {
      closeLoading();
      alertError('Erro na comunicação com o Servidor Central.');
      console.log('Erro', error);
    });
};

const promptToConfirm = (drugParam) => {
  const question = drugParam.active
    ? 'Deseja Inactivar o Medicamento?'
    : 'Deseja Activar o Medicamento?';
  alertWarningAction(question).then((response) => {
    if (response) {
      if (drugParam.active) {
        drugParam.active = false;
      } else {
        drugParam.active = true;
      }
      drugParam.clinicalService = {};
      drugParam.clinicalService.id = drugParam.clinical_service_id;
      drugParam.form = {};
      drugParam.form.id = drugParam.form_id;
      drugService
        .patch(drugParam.id, drugParam)
        .then(() => {
          alertSucess('Medicamento actualizado com sucesso.');
        })
        .catch(() => {
          alertError(
            'Aconteceu um erro inesperado ao actualizar o Medicamento.'
          );
        });
    }
  });
};
/*Provides*/
provide('selectedDrug', drug);
provide('forms', forms);
provide('drugs', drugs);
</script>
