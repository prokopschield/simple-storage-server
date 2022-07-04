import fs from 'fs';
import { DB } from 'insta-db';
import path from 'path';

import { dbconfig } from './config';

if (fs.existsSync(dbconfig.copies_dir)) {
    for (const filename of fs.readdirSync(dbconfig.copies_dir)) {
        const file = path.resolve(dbconfig.copies_dir, filename);

        if (!dbconfig.copies.includes(file)) {
            dbconfig.copies.push(file);
        }
    }
}

if (fs.existsSync(dbconfig.rocopy_dir)) {
    for (const filename of fs.readdirSync(dbconfig.rocopy_dir)) {
        const file = path.resolve(dbconfig.rocopy_dir, filename);

        if (!dbconfig.rocopies.includes(file)) {
            dbconfig.rocopies.push(file);
        }
    }
}

export const database = new DB({
    size: dbconfig.size,
    read_only_files: [...dbconfig.rocopies],
    storage_copies: [...dbconfig.copies],
    storage_file: dbconfig.storage_file,
});
