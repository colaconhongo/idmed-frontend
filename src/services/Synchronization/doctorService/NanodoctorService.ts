import doctorService from 'src/services/api/doctorService/doctorService';
import api from '../../api/apiService/apiService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import Doctor from 'src/stores/models/doctor/Doctor';

const doctorDexie = db[Doctor.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('doctor?offset=' + offset + '&max=100')
        .then((resp) => {
          doctorService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Doctor');
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
    console.log('Data synced from backend To Piania Doctor');
    (await SynchronizationService.hasData(doctorDexie))
      ? await doctorService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie Doctor');
    const getAllDoctor = doctorService.getAlldoctors();
    await doctorDexie.bulkPut(getAllDoctor);
  },
};
