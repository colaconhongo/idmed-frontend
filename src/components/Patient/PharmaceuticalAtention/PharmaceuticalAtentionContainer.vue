<template>
  <div v-for="patientVisit in patientVisits" :key="patientVisit.id">
    <q-expansion-item
      dense
      header-class="bg-grey-6 text-white text-bold vertical-middle q-pl-md"
      expand-icon-class="text-white"
      :default-opened="patientVisits[0] === patientVisit"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon color="white" name="medical_services" />
        </q-item-section>

        <q-item-section>
          Data do Registo: {{ formatDate(patientVisit.visitDate) }}
        </q-item-section>
      </template>

      <q-card class="noRadius">
        <q-card-section class="row q-pa-none">
          <div class="col-12">
            <q-table
              class="col"
              dense
              unelevated
              separator="vertical"
              :rows="patientVisit.vitalSignsScreenings"
              :columns="columns"
              row-key="id"
              hide-bottom
            >
              <template #header="props">
                <q-tr class="text-left bg-grey-2" :props="props">
                  <q-th>{{ columns[0].label }}</q-th>
                  <q-th>{{ columns[1].label }}</q-th>
                  <q-th v-if="!isMale(patient)">{{ columns[2].label }}</q-th>
                  <q-th>{{ columns[3].label }}</q-th>
                  <q-th>{{ columns[4].label }}</q-th>
                  <q-th v-if="!isProvincialInstalation()">{{
                    columns[5].label
                  }}</q-th>
                  <q-th
                    v-if="
                      (patient.isLast && !isProvincialInstalation()) ||
                      isProvincialInstalationPharmacysMode() ||
                      isProvincialInstalationMobileClinic()
                    "
                    >{{ columns[5].label }}</q-th
                  >
                </q-tr>
              </template>

              <template #body="props">
                <q-tr no-hover :props="props">
                  <q-td key="vitalSignsScreenings" :props="props">
                    <span class="text-weight-medium">Peso:</span>
                    {{ props.row.weight + ' Kg' }}
                    <span class="text-weight-bolder"> | </span>
                    <span class="text-weight-medium">Altura:</span>
                    {{ props.row.height + ' m' }}
                    <span class="text-weight-bolder"> | </span>
                    <span class="text-weight-medium">IMC:</span>
                    {{ Math.round(props.row.imc * 100) / 100 + '' }}
                    <span class="text-weight-bolder"> | </span>
                    <span class="text-weight-medium">Sistole:</span>
                    {{ props.row.systole + ' mmhHg' }}
                    <span class="text-weight-bolder"> | </span>
                    <span class="text-weight-medium">Diastole:</span>
                    {{ props.row.distort + ' mmHg' }}
                  </q-td>
                  <q-td key="tbScreenings" :props="props">
                    <q-btn
                      v-if="patientVisit.tbScreenings.length > 0"
                      class="q-pa-none"
                      flat
                      color="primary"
                      label="Ver Detalhes"
                      @click="showTB(patientVisit)"
                    />
                    <q-btn
                      v-else
                      disable="true"
                      class="q-pa-none"
                      flat
                      color="grey-6"
                      label="Sem Rastreio"
                    />
                  </q-td>
                  <q-td
                    v-if="!isMale(patient)"
                    auto-width
                    key="pregnancyScreenings"
                    :props="props"
                  >
                    <q-btn
                      v-if="patientVisit.pregnancyScreenings.length > 0"
                      class="q-pa-none"
                      flat
                      color="primary"
                      label="Ver Detalhes"
                      @click="showPregnancy(patientVisit)"
                    />
                    <q-btn
                      v-else
                      disable="true"
                      class="q-pa-none"
                      flat
                      color="grey-6"
                      label="Sem Rastreio"
                    />
                  </q-td>
                  <q-td auto-width key="adherenceScreenings" :props="props">
                    <q-btn
                      v-if="patientVisit.adherenceScreenings.length > 0"
                      class="q-pa-none"
                      flat
                      color="primary"
                      label="Ver Detalhes"
                      @click="showAdherence(patientVisit)"
                    />
                    <q-btn
                      v-else
                      disable="true"
                      class="q-pa-none"
                      flat
                      color="grey-6"
                      label="Sem Rastreio"
                    />
                  </q-td>
                  <q-td auto-width key="ramScreenings" :props="props">
                    <q-btn
                      v-if="patientVisit.ramScreenings.length > 0"
                      class="q-pa-none"
                      flat
                      color="primary"
                      label="Ver Detalhes"
                      @click="showAdverse(patientVisit)"
                    />
                    <q-btn
                      v-else
                      disable="true"
                      class="q-pa-none"
                      flat
                      color="grey-6"
                      label="Sem Rastreio"
                    />
                  </q-td>
                  <q-td
                    auto-width
                    key="opts"
                    :props="props"
                    v-if="
                      !isProvincialInstalation() ||
                      isProvincialInstalationPharmacysMode() ||
                      isProvincialInstalationMobileClinic()
                    "
                  >
                    <div class="col">
                      <q-btn
                        flat
                        @click="editButtonActions(patientVisit)"
                        round
                        :disable="
                          patientVisits[0].vitalSignsScreenings[0].id ===
                            props.row.id &&
                          patientVisits[0].id === patientVisit.id
                            ? false
                            : true
                        "
                        :color="
                          patientVisits[0].vitalSignsScreenings[0].id ===
                            props.row.id &&
                          patientVisits[0].id === patientVisit.id
                            ? 'orange-5'
                            : 'grey-5'
                        "
                        icon="edit"
                      >
                        <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        @click.stop="promptToConfirm(patientVisit)"
                        round
                        :disable="
                          patientVisits[0].vitalSignsScreenings[0].id ===
                            props.row.id &&
                          patientVisits[0].id === patientVisit.id
                            ? false
                            : true
                        "
                        :color="
                          patientVisits[0].vitalSignsScreenings[0].id ===
                            props.row.id &&
                          patientVisits[0].id === patientVisit.id
                            ? 'red'
                            : 'grey-5'
                        "
                        icon="delete"
                      >
                        <q-tooltip class="bg-red">Remover</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </q-card-section>
        <q-dialog persistent v-model="viewTb">
          <q-card style="max-width: 1500px; width: 1200px; height: 700px">
            <q-card-section class="q-pa-none">
              <tbTable />
            </q-card-section>
          </q-card>
        </q-dialog>
        <q-dialog v-if="!isMale(patient)" persistent v-model="viewPregnancy">
          <q-card style="max-width: 1500px; width: 900px; height: 400px">
            <q-card-section class="q-pa-none">
              <pregnancyTable />
            </q-card-section>
          </q-card>
        </q-dialog>
        <q-dialog persistent v-model="viewAdherence">
          <q-card style="max-width: 1500px; width: 900px; height: 350px">
            <q-card-section class="q-pa-none">
              <adherenceTable />
            </q-card-section>
          </q-card>
        </q-dialog>
        <q-dialog persistent v-model="viewRam">
          <q-card style="max-width: 1500px; width: 900px; height: 350px">
            <q-card-section class="q-pa-none">
              <ramTable />
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-card>
    </q-expansion-item>
    <q-separator />
  </div>
</template>

<script setup>
import { inject } from 'vue';
import tbTable from 'components/Patient/PharmaceuticalAtention/TbQuestionsTable.vue';
import pregnancyTable from 'components/Patient/PharmaceuticalAtention/PregnancyQuestionsTable.vue';
import adherenceTable from 'components/Patient/PharmaceuticalAtention/MonitoringReinforcementAdherinTable.vue';
import ramTable from 'components/Patient/PharmaceuticalAtention/AdverseReactionQuestiosTable.vue';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';

const { isMale } = usePatient();
const { formatDate } = useDateUtils();
const { closeLoading, showloading } = useLoading();
const { website } = useSystemUtils();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const {
  isProvincialInstalation,
  isProvincialInstalationPharmacysMode,
  isProvincialInstalationMobileClinic,
} = useSystemConfig();

const columns = [
  {
    name: 'vitalSignsScreenings',
    required: true,
    field: 'row.vitalSignsScreenings',
    label: 'Dados Vitais',
    align: 'left',
    sortable: false,
  },
  {
    name: 'tbScreenings',
    align: 'left',
    field: 'row.tbScreenings',
    label: 'Rastreio TB',
    sortable: false,
  },
  {
    name: 'pregnancyScreenings',
    align: 'left',
    field: 'row.pregnancyScreenings',
    label: 'Rastreio Gravidez',
    sortable: false,
  },
  {
    name: 'adherenceScreenings',
    align: 'left',
    field: 'row.adherenceScreenings',
    label: 'Monitoria e Reforço a Adesão',
    sortable: false,
  },
  {
    name: 'ramScreenings',
    align: 'left',
    field: 'row.ramScreenings',
    label: 'Reações Adversas',
    sortable: false,
  },
  { name: 'opts', align: 'left', label: 'Opções', sortable: false },
];

// inject
const patient = inject('patient');
const patientVisits = inject('patientVisits');
const viewTb = inject('viewTb');
const viewPregnancy = inject('viewPregnancy');
const viewAdherence = inject('viewAdherence');
const viewRam = inject('viewRam');
const showTB = inject('showTB');
const showPregnancy = inject('showPregnancy');
const showAdherence = inject('showAdherence');
const showAdverse = inject('showAdverse');
const editButtonActions = inject('editButtonActions');

//Methods
const promptToConfirm = (patientVisitParams) => {
  showloading();
  alertWarningAction('Deseja Apagar a atenção farmaceutica?').then((result) => {
    if (result) {
      patientVisitService
        .delete(patientVisitParams.id)
        .then((resp) => {
          closeLoading();
          console.log(resp);
          alertSucess('Atenção farmaceutica removida com sucesso');
        })
        .catch((error) => {
          closeLoading();
          console.log(error);
          alertError('Aconteceu um erro ao remover a Atenção Farmaceutica');
        });
    } else {
      closeLoading();
      alertInfo('Operação cancelada');
    }
  });
};
</script>

<style>
.noRadius {
  border-radius: 0px;
}
</style>
