import api from '../../api/apiService/apiService';
import SpetialPrescriptionMotive from 'src/stores/models/prescription/SpetialPrescriptionMotive';
import spetialPrescriptionMotiveService from 'src/services/api/spetialPrescriptionMotive/spetialPrescriptionMotiveService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const spetialPrescriptionMotiveDexie = db[SpetialPrescriptionMotive.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('spetialPrescriptionMotive?offset=' + offset + '&max=100')
        .then((resp) => {
          spetialPrescriptionMotiveService.addBulkMobile(resp.data);
          console.log('Data synced from backend: SpetialPrescriptionMotive');
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
    console.log('Data synced from backend To Piania SpetialPrescriptionMotive');
    (await SynchronizationService.hasData(spetialPrescriptionMotiveDexie))
      ? await spetialPrescriptionMotiveService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie SpetialPrescriptionMotive');
    const getAllSpetialPrescriptionMotive =
      spetialPrescriptionMotiveService.getAllFromStorage();
    await spetialPrescriptionMotiveDexie.bulkPut(
      getAllSpetialPrescriptionMotive
    );
  },
};
