<template>
<div ref="filterImportedPatient">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Lista de Pacientes importados de outros sistemas
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section >
         Lista de Pacientes importados de outros sistemas
        </q-item-section>

        <q-item-section top side>
            <div class="text-grey-8 q-gutter-xs">
            <q-btn class="gt-xs" size="12px" flat dense round  >Excel</q-btn> |
            <q-btn class="gt-xs" size="12px" flat dense round >Pdf</q-btn>

            </div>
        </q-item-section>
    </q-item>
  </div>
  </div>
</template>

<script setup>
   import { ref } from 'vue';

   const  props = ['selectedService']
    const name = 'ImportedPatientList'
    const filterImportedPatient = ref('')
    onMounted (() => {
      console.log(selectedService)
    })

    const  closeSection = () => {
        filterImportedPatient.value.remove()
      }

</script>

<style lang="scss" scoped>
  .param-container {
    border-bottom: 1px dashed $grey-13;
    border-left: 1px dashed $grey-13;
    border-right: 1px dashed $grey-13;
    border-radius: 0px 0px 5px 5px;
  }
</style>
