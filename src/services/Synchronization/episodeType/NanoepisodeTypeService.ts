import api from '../../api/apiService/apiService';
import episodeTypeService from 'src/services/api/episodeType/episodeTypeService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';
import EpisodeType from 'src/stores/models/episodeType/EpisodeType';

const episodeTypeDexie = db[EpisodeType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('episodeType?offset=' + offset + '&max=100')
        .then((resp) => {
          episodeTypeService.addBulkMobile(resp.data);
          console.log('Data synced from backend: EpisodeType');
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
    console.log('Data synced from backend To Piania EpisodeType');
    (await SynchronizationService.hasData(episodeTypeDexie))
      ? await episodeTypeService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie EpisodeType');
    const getAllEpisodeType = episodeTypeService.getAllFromStorage();
    await episodeTypeDexie.bulkPut(getAllEpisodeType);
  },
};
