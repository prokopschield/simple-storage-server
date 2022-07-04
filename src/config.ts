import { getConfig } from 'doge-config';
import path from 'path';

export const config = getConfig('simple-storage-server', {
    port: 8080,
    host: '0.0.0.0',

    storage_file: 'default.db',

    copies_dir: path.resolve('copies/'),
    copies: [],

    rocopy_dir: path.resolve('rocopies/'),
    rocopies: [],

    size: 1024 * 1024 * 1024,
});

export const { port } = config.num;
export const { host } = config.str;

export const dbconfig = {
    storage_file: config.str.storage_file,
    copies_dir: config.str.copies_dir,
    copies: config.obj.copies.array.map(String),
    rocopy_dir: config.str.rocopy_dir,
    rocopies: config.obj.rocopies.array.map(String),
    size: config.num.size,
};
