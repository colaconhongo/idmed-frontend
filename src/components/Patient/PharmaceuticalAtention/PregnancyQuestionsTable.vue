<template>
  <div class="q-pa-md" style="width: 900px; max-width: 90vw">
    <q-table
      title="Rasterio de Gravidez"
      :rows="pregnancyQuestions"
      :columns="columns"
      row-key="question"
      :separator="separator"
      :rows-per-page-options="[0]"
      virtual-scroll
      hide-bottom
      table-header-class="text-white"
      class="my-sticky-header-table"
      title-class="text-bold text-white"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="question">
            {{ props.row.question }}
          </q-td>
          <q-td key="completed" v-if="props.row.code !== '03'" align="right">
            <q-radio
              v-model="props.row.completed"
              val="true"
              @update:model-value="handleInput(props.row)"
              :disable="onlyView"
            />
          </q-td>
          <q-td key="completed" v-if="props.row.code !== '03'" align="left">
            <q-radio
              v-model="props.row.completed"
              val="false"
              @update:model-value="handleInput(props.row)"
              :disable="onlyView"
            />
          </q-td>
          <q-td key="date" v-if="props.row.code === '03' && visible === true">
            <q-input
              dense
              outlined
              class="col"
              v-model="props.row.date"
              mask="date"
              :rules="['date']"
              label="Data da Ultima Menstruação"
              :disable="onlyView"
              @update:model-value="handleInput(props.row)"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="props.row.date"
                      :options="optionsNonFutureDate"
                      @update:model-value="handleInput(props.row)"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-card>
      <q-card-actions align="right" class="q-mb-md q-mr-sm" v-if="onlyView">
        <q-btn
          label="Sair"
          color="red"
          @click="closeButtonActions()"
          align="right"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>
<script setup>
import moment from 'moment';
import { computed, inject, onMounted, ref } from 'vue';

// Declaration
const columns = [
  {
    name: 'question',
    required: true,
    label: 'Perguntas de Rastreio de Gravidez',
    align: 'left',
    field: (row) => row.question,
    format: (val) => `${val}`,
  },
  { name: 'sim', label: 'Sim', field: (row) => row.completed, align: 'right' },
  { name: 'nao', label: 'Não', field: (row) => row.completed, align: 'left' },
];

const pregnancyQuestions = ref([
  {
    question: 'Está gravida?',
    completed: false,
    code: '01',
  },
  {
    question: 'Teve menstruação nos ultimos meses?',
    completed: false,
    code: '02',
  },
  {
    question: '',
    completed: true,
    code: '03',
    date: '',
  },
]);

const visible = ref('');
const separator = ref('horizontal');
// Inject
const pregnancyScreening = inject('pregnancyScreening');
const onlyView = inject('onlyView');
const closeButtonActions = inject('closeButtonActions');
const showPatientVisit = inject('showPatientVisit');

onMounted(() => {
  addingValueToArray();
});

//Computed
const selectedPregnancyTracing = computed(() => {
  if (pregnancyScreening !== null && pregnancyScreening !== undefined) {
    return pregnancyScreening.value;
  } else {
    return showPatientVisit.value.pregnancyScreenings[0];
  }
});

// Methods
const optionsNonFutureDate = (date) => {
  return date <= moment().format('YYYY/MM/DD');
};
const handleInput = (row) => {
  switch (row.code) {
    case '01':
      pregnancyScreening.value.pregnant = row.completed;
      if (row.completed === 'true' || row.completed === true) {
        visible.value = false;
      } else {
        visible.value = true;
      }
      break;
    case '02':
      pregnancyScreening.value.menstruationLastTwoMonths = row.completed;
      break;
    case '03':
      if (
        pregnancyScreening.value.pregnant === 'false' ||
        pregnancyScreening.value.pregnant === false
      ) {
        pregnancyScreening.value.lastMenstruation = new Date(row.date);
      } else {
        pregnancyScreening.value.lastMenstruation = '';
      }
      break;
    default:
      console.log('Sorry, we are out of .');
  }
};
const addingValueToArray = () => {
  if (selectedPregnancyTracing.value) {
    visible.value = !selectedPregnancyTracing.value.pregnant;
    pregnancyQuestions.value.forEach((pregnancyQuestion) => {
      if (pregnancyQuestion.code === '01')
        pregnancyQuestion.completed = String(
          selectedPregnancyTracing.value.pregnant
        );
      if (pregnancyQuestion.code === '02')
        pregnancyQuestion.completed = String(
          selectedPregnancyTracing.value.menstruationLastTwoMonths
        );
      if (pregnancyQuestion.code === '03')
        pregnancyQuestion.date =
          selectedPregnancyTracing.value.lastMenstruation;
    });
  }
};
</script>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */

  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #26A69A

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 0px
</style>
