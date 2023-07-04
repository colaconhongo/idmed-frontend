import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import SpetialPrescriptionMotive from 'src/stores/models/prescription/SpetialPrescriptionMotive';
import { useRepo } from 'pinia-orm';
const spetialPrescriptionMotive = useRepo(SpetialPrescriptionMotive);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('spetialPrescriptionMotive?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(SpetialPrescriptionMotive.entity)
            .query('upsert', resp.data)
            .exec();
          spetialPrescriptionMotive.save(resp.data);
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
};
