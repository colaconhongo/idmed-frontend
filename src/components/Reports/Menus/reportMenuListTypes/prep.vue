<template>
  <q-expansion-item
    v-for="menu in menu"
    :key="menu.id"
    group="somegroup"
    :label="menu.description"
    header-class="bg-green-1 text-black"
    expand-icon-class="text-black"
    class="q-ma-sm"
  >
    <q-card class="bg-white">
      <div
        class="q-pa-sm no-margin no-padding full-height"
        style="max-width: 1000px"
      >
        <q-list bordered separator>
          <q-item
            v-for="(item, index) in menu.menuItem"
            :key="index"
            clickable
            v-ripple
            :active="true"
            class="bg-orange-1 q-ma-sm text-black"
            @click="changeTab(item.tabName)"
          >
            <q-item-section> {{ item.description }} </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card>
  </q-expansion-item>
</template>

<script setup>
import { computed, ref, inject, onMounted, provide } from 'vue';

const emit = defineEmits(['changeTab']);
const selectedService = ref(null);
const currTab = ref('');
const menu = [
  {
    description: 'Pacientes',
    id: 1,
    menuItem: [
      // { description: 'Activos na Farmácia', tabName: 'ActivesInDrugStore' },
      //  { description: 'Lista de transferidos PARA', tabName: 'TransferedTo' },
      //  { description: 'Lista de transferidos DE', tabName: 'TransferedFrom' },
      //  { description: 'Lista de Visitantes', tabName: 'GuestList' },
      //  { description: 'Lista de pacientes importados de outros Sistemas', tabName: 'ImportedPatientList' }
    ],
  },
  {
    description: 'Gestão de Farmácia',
    id: 2,
    menuItem: [
      // {
      //     description: 'Lista de Pacientes Faltosos ao Levantamento',
      //     tabName: 'AbsentPatients',
      // },
      // {
      //     description: 'Mapa Mensal de Informação de ARV (MMIA)',
      //     tabName: 'Mmia',
      // },
      //  { description: 'Lista de transferidos DE', tabName: 'TransferedFrom' },
      //  { description: 'Lista de Visitantes', tabName: 'GuestList' },
      //  { description: 'Lista de pacientes importados de outros Sistemas', tabName: 'ImportedPatientList' },
      {
        description: 'Histórico de Levantamentos PREP',
        tabName: 'PatientHistoryPREP',
      },
    ],
  },
  {
    description: 'Referências',
    id: 3,
    menuItem: [
      // {
      //     description: 'Lista de Pacientes Referidos Para outras Farmacias',
      //     tabName: 'ReferredPatients',
      // },
      // {
      //     description: 'Lista de Pacientes que voltaram da Referencia',
      //     tabName: 'ReferredBackPatients',
      // },
      // {
      //     description:
      //     'Lista de Pacientes referidos faltosos em outras Farmacias',
      //     tabName: 'AbsentReferredPatients',
      // },
      // {
      //     description: 'Historico de Levantamentos de Pacientes Referidos',
      //     tabName: 'ReferredPatientDispenseHistory',
      // },
    ],
  },
  {
    description: 'Stock',
    id: 4,
    menuItem: [
      // { description: 'Lista de Stock Recebido', tabName: 'ReceivedStock' },
      // { description: 'Lista de Stock Usado', tabName: 'UsedStock' },
    ],
  },
  {
    description: 'Monitoria e Avaliação',
    id: 5,
    menuItem: [
      {
          description: 'Lista de Registro Diário de PREP',
          tabName: 'PrepDailyRegister',
      },
      // {
      //     description: 'Lista de Registro Diário de ARV',
      //     tabName: 'ArvDailyRegister',
      // },
      // {
      //     description: 'Lista de Dispensas Nao Sicronizadas Para o OpenMrs',
      //     tabName: 'NotSynchronizedPack',
      // },
    ],
  },
];

const changeTab = (tabName) => {
  currTab.value = tabName;
  emit('changeTab', tabName, selectedService.value);
};

onMounted(() => {
  //
});
</script>
