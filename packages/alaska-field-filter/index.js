// @flow

import alaska, { Field } from 'alaska';

import mongoose from 'mongoose';

export default class FilterField extends Field {
  static views: Object = {
    view: {
      name: 'FilterFieldView',
      path: `${__dirname}/lib/view.js`
    }
  };
  static plain = mongoose.Schema.Types.Mixed;
  static viewOptions: Array<string|(options: Object, field: Alaska$Field)=>void> = ['ref'];

  init() {
    // $Flow this.ref有可能为空
    let mRef: Class<Alaska$Model> = this.ref || alaska.error(`${this._model.path}.fields.${this.path}.ref not found`);
    let ref: string = '';
    if (mRef.isModel) {
      ref = mRef.path;
    } else if (ref[0] !== ':' && ref.indexOf('.') === -1) {
      ref = this._model.service.id + '.' + ref;
    }
    this.ref = mRef;

    let service = this._model.service;

    let field = this;
    this.underscoreMethod('filter', function () {
      let data = this.get(field.path);
      if (!data) return null;
      let modelPath = ref;
      if (ref[0] === ':') {
        modelPath = this.get(ref.substr(1));
        if (!modelPath) return null;
      }
      if (!modelPath) {
        return null;
      }
      let Model = service.model(modelPath, true);
      if (!Model) return null;
      return Model.createFilters('', data);
    });
  }
}
