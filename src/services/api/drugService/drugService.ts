import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Drug from 'src/stores/models/drug/Drug';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import InventoryStockAdjustmentService from '../stockAdjustment/InventoryStockAdjustmentService';
import StockService from '../stockService/StockService';

const { isMobile, isOnline } = useSystemUtils();

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const drug = useRepo(Drug);
const drugDexie = db[Drug.entity];

export default {
  async post(params: string) {
    const resp = await api().post('drug', params);
    drug.save(resp.data);
    alertSucess('O Registo foi efectuado com sucesso');
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      if (offset >= 0) {
        // showloading();
        return (
          api()
            .get('drug?offset=' + offset + '&max=100', {
              onDownloadProgress(progressEvent) {
                // showloading();
              },
            })
            // .get('drug?offset=' + offset + '&max=100')
            .then((resp) => {
              drug.save(resp.data);
              offset = offset + 100;
              if (resp.data.length > 0) {
                this.get(offset);
              } else {
                closeLoading();
              }
            })
        );
      }
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drug?offset=' + offset + '&max=100')
        .then((resp) => {
          drug.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  getFromProvincial(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drug/drugFromProvicnial/' + offset)
        .then((resp) => {
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromProvincial(offset);
          } else {
            this.get(0);
            alertSucess('Lista actualizada com sucesso');
          }
        });
    }
  },
  async getInventoryDrugs(id: string) {
    if (isOnline.value) {
      return await this.getInventoryDrugsWeb(id);
    } else {
      return await this.getInventoryDrugsMobile(id);
    }
  },
  async patch(id: string, params: string) {
    const resp = await api().patch('drug/' + id, params);
    drug.save(JSON.parse(resp.config.data));
    alertSucess('O Registo foi alterado com sucesso');
  },
  async delete(id: number) {
    await api().delete('drug/' + id);
    drug.destroy(id);
  },

  async getInventoryDrugsWeb(id: any) {
    return api()
      .get('drug/getInventoryDrugs/' + id)
      .then((resp) => {
        closeLoading();
        return resp.data;
      });
  },

  //Mobile
  getMobile() {
    return drugDexie
      .toArray()
      .then((rows: any) => {
        drug.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },

  async getDrugsByIds(drugIds: any) {
    return await drugDexie.where('id').anyOf(drugIds).toArray();
  },

  async getMobileDrugById(drugId: any) {
    return drugDexie
      .where('id')
      .equalsIgnoreCase(drugId)
      .first()
      .then((result: any) => {
        return result;
      });
  },
  async getInventoryDrugsMobile(inventoryId: any) {
    // Step 1: Query StockAdjustments table for the given inventory ID
    const adjustments =
      await InventoryStockAdjustmentService.apiGetAdjustmentsByInventoryIdMobile(
        inventoryId
      );
    const adjustedStockIds = adjustments.map((adj) => adj.adjustedStock.id);
    const stocks = await StockService.getStocksByIds(adjustedStockIds);

    const drugIds = stocks.map((stock) => stock.drug.id);
    const drugs = await this.getDrugsByIds(drugIds);
    const drugMap = new Map();
    drugs.forEach((drug) => {
      const key = `${drug.fnmCode}-${drug.name}-${drug.id}`;
      if (!drugMap.has(key)) {
        drugMap.set(key, drug);
      }
    });

    return Array.from(drugMap.values());
  },
  addBulkMobile(params: any) {
    return drugDexie
      .bulkPut(params)
      .then(() => {
        drug.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getActiveDrugs() {
    return drug.query().withAllRecursive(1).where('active', true).get();
  },
  getDrugsFromListId(drugListId: []) {
    const item = drug.query().withAllRecursive(1).find(drugListId);
    return item;
  },
  getDrugsWithValidStockInList() {
    return drug
      .query()
      .withAllRecursive(1)
      .whereHas('stocks', (query) => {
        query.where((stock) => {
          return moment(stock.expireDate, 'YYYY-MM-DD').isAfter(
            moment().format('YYYY-MM-DD')
          );
        });
        query.orderBy('expireDate', 'asc');
      })
      .get();
  },
  getActiveDrugsByRegimen(regimenId: string) {
    return drug
      .query()
      .withAllRecursive(2)
      .where('active', true)
      .whereHas('therapeuticRegimenList', (query) => {
        query.where('id', regimenId);
      })
      .get();
  },
  getDrugById(id: string) {
    return drug
      .query()
      .withAllRecursive(1)
      .whereHas('stocks', (query) => {
        query.orderBy('expireDate', 'asc');
      })
      .where('id', id)
      .first();
  },
  getDrugWith1ById(id: string) {
    return drug.query().withAllRecursive(1).where('id', id).first();
  },
  getDrugWith2ById(id: string) {
    return drug.query().withAllRecursive(2).where('id', id).first();
  },
  getCleanDrugById(id: string) {
    return drug.where('id', id).first();
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return drug.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllDrugs() {
    return drug.withAllRecursive(1).orderBy('name').get();
  },

  getAllForAllDrugs() {
    return drug.orderBy('name').get();
  },

  savePinia(drugs: any) {
    drug.save(drugs);
  },

  // Mobile

  async getAllActiveDrugsMobile() {
    return nSQL('drugs')
      .query('select')
      .exec()
      .then((result) => {
        drug.save(result);
        return result;
      });
  },

  async hasStock(drug: any) {
    return nSQL('stocks')
      .query('select')
      .where(['drug_id', '=', drug.id])
      .exec()
      .then((result) => {
        return result.length > 0;
      });
  },
  async getAllByIDsFromDexie(ids: []) {
    return await drugDexie.where('id').anyOf(ids).toArray();
  },
};
