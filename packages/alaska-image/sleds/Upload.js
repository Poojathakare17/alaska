// @flow

import alaska, { Sled } from 'alaska';
import request from 'request-async';
import mime from 'mime';
import path from 'path';
import Image from '../models/Image';

export default class Upload extends Sled {
  async exec() {
    // $Flow this.data 不知道从哪来的
    let { file, data, url, user, headers, filename, ext, mimeType, returnImage } = this.data;

    if (!file && data) {
      if (Buffer.isBuffer(data)) {
        //buffer
        file = data;
      } else if (typeof data === 'string') {
        //base64
        file = new Buffer(data, 'base64');
      }
    }

    if (!file && url) {
      let res = await request({ url, headers, encoding: null });
      file = res.body;
      if (!filename) {
        filename = path.basename(url);
      }
      if (!mimeType) {
        mimeType = mime.lookup(url);
      }
    }
    if (!file) alaska.error('No file found');
    if (filename) {
      // $Flow file 类型不固定
      file.filename = filename;
    }
    if (ext) {
      // $Flow file 类型不固定
      file.ext = ext;
    }
    if (mimeType) {
      // $Flow file 类型不固定
      file.mimeType = mimeType;
    }
    let record = new Image({ user });
    await record._.pic.upload(file);
    if (record.pic._id) {
      record._id = record.pic._id;
    }
    await record.save();
    return returnImage ? record.pic : record;
  }
}