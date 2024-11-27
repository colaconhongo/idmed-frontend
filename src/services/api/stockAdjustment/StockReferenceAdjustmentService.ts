import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { StockReferenceAdjustment } from 'src/stores/models/stockadjustment/StockReferenceAdjustment';
import db from 'src/stores/dexie';
import StockOperationTypeService from '../stockOperationTypeService/StockOperationTypeService';

const stockReferenceAdjustment = useRepo(StockReferenceAdjustment);
const stockReferenceAdjustmentDexie = db[StockReferenceAdjustment.entity];

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('referedStockMoviment', params)
      .then((resp) => {
        stockReferenceAdjustment.save(resp.data);
      });
  },

  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockReferenceAdjustment?offset=' + offset + '&max=100')
        .then((resp) => {
          stockReferenceAdjustment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('stockReferenceAdjustment/' + id, params)
      .then((resp) => {
        stockReferenceAdjustment.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stockReferenceAdjustment/' + id)
      .then(() => {
        stockReferenceAdjustment.destroy(id);
      });
  },
  // Local Storage Pinia
  deleteAllFromStorage() {
    stockReferenceAdjustment.flush();
  },
  addMobile(params: string) {
    return stockReferenceAdjustmentDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        stockReferenceAdjustment.save(JSON.parse(JSON.stringify(params)));
      });
  },

  async getBystockMobile(stock: any) {
    return await stockReferenceAdjustmentDexie
      .where('stock_id')
      .equalsIgnoreCase(stock.id)
      .toArray()
      .then((rows: any) => {
        stockReferenceAdjustment.save(rows);
        return rows;
      });
  },
  async getAllByStockIDsFromDexie(ids: []) {
    const stockReferenceAdjustments = await stockReferenceAdjustmentDexie
      .where('adjusted_stock_id')
      .anyOfIgnoreCase(ids)
      .toArray();

    const operationIds = stockReferenceAdjustments.map(
      (stockReferenceAdjustment: any) => stockReferenceAdjustment.operation_id
    );

    const [stockOperationTypes] = await Promise.all([
      StockOperationTypeService.getAllByIDsFromDexie(operationIds),
    ]);

    stockReferenceAdjustments.map((stockReferenceAdjustment: any) => {
      stockReferenceAdjustment.operation = stockOperationTypes.find(
        (stockOperationType: any) =>
          stockOperationType.id === stockReferenceAdjustment.operation_id
      );
    });

    return stockReferenceAdjustments;
  },
  deleteAllFromDexie() {
    stockReferenceAdjustmentDexie.clear();
  },
};
