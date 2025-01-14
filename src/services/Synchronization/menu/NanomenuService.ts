import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import Menu from 'src/stores/models/userLogin/Menu';
import { useRepo } from 'pinia-orm';
import menuService from 'src/services/api/menu/menuService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const menu = useRepo(Menu);
const menuDexie = db[Menu.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('menu?offset=' + offset + '&max=100')
        .then((resp) => {
          menuService.addBulkMobile(resp.data);
          console.log('Data synced from backend: Menu');
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
    console.log('Data synced from backend To Piania Menu');
    (await SynchronizationService.hasData(menuDexie))
      ? await menuService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie Menu');
    const getAllMenus = menuService.getAllFromStorage();
    await menuDexie.bulkPut(getAllMenus);
  },
};
