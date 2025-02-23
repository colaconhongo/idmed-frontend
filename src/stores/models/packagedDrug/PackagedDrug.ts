import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import Pack from '../packaging/Pack';
import PackagedDrugStock from './PackagedDrugStock';
import { v4 as uuidv4 } from 'uuid';

export default class PackagedDrug extends Model {
  static entity = 'packagedDrugs';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      amtPerTime: this.attr(''),
      timesPerDay: this.attr(''),
      form: this.attr(''),
      quantitySupplied: this.attr(''),
      nextPickUpDate: this.attr(''),
      toContinue: this.boolean(true),
      creationDate: this.attr(''),
      pack_id: this.attr(''),
      drug_id: this.attr(''),
      syncStatus: this.attr(''),
      quantityRemain: this.attr(''),
      origin: this.attr(''),
      // Relationships
      pack: this.belongsTo(Pack, 'pack_id'),
      drug: this.belongsTo(Drug, 'drug_id'),
      packagedDrugStocks: this.hasMany(
        PackagedDrugStock,
        'packagedDrugStock_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
