<template>
<div ref="filterGuestListSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Lista de Visitantes
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section >
         Lista de Visitantes
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
import ListHeader from  'components/Shared/ListHeader.vue'
    const props =  defineProps(['selectedService'])
    const name =  'GuestList'
    const filterGuestListSection = ref('')
    onMounted( () => {
      console.log(selectedService)
    })

    const  closeSection =  () => {
        filterGuestListSection.value.remove()
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
