import api from '../../api/apiService/apiService';
import dispenseTypeService from 'src/services/api/dispenseType/dispenseTypeService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import DispenseType from 'src/stores/models/dispenseType/DispenseType';

const dispenseTypeDexie = db[DispenseType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('dispenseType?offset=' + offset + '&max=100')
        .then((resp) => {
          dispenseTypeService.addBulkMobile(resp.data);
          console.log('Data synced from backend: DispenseType');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania DispenseType');
    (await SynchronizationService.hasData(dispenseTypeDexie))
      ? await dispenseTypeService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie DispenseType');
    const getAllDispenseType = dispenseTypeService.getAllFromStorage();
    await dispenseTypeDexie.bulkPut(getAllDispenseType);
  },
};
