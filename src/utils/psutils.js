
import {core, app, action, constants, imaging} from 'photoshop';
const fs = require('uxp').storage.localFileSystem;
export const FOLDERNAME = {
    assets3d: '3dassets',
    batchplay: 'batchplay',
    blender: 'blender',
    blender40: 'blender4.0',
    customscripts: 'customscripts',
    download: 'download',
    gigapixel: 'gigapixel',
    inang: 'inang',
    midasresult: 'midasresult',
    midastemp: 'midastemp',
    naufal: 'naufal',
    ogie: 'ogie',
    refly: 'refly',
    smartobject: 'smartobject',
    template: 'template',
    texture: 'texture',
    comfyui: 'ComfyUI',
  };
  
  export const STORAGE = {
    TEMPLATE_DEFAULT_INDEX: 'template_default_index',
    COLORS: 'COLORS_STORE',
    TRICOLOR: 'STORAGE_TRICOLOR',
  };
  
  export const TOKEN = {
    ROOTFOLDER: 'token_root_folder',
    SMARTOBJECTS: 'token_smart_objects',
    ONLINEMAGE: 'token_online_images',
    TEXTURES: 'token_textures',
  };

  export function GetTokenFor(key) {
    const savedToken = localStorage.getItem(key);
    
    return new Promise(async (resolve, reject) => {
      if (!savedToken) {
        reject('Not Exist');
        return null;
      }
      const newToken = await fs.getEntryForPersistentToken(savedToken);
      console.log(newToken.isFolder);
      newToken.isFolder ? resolve(newToken) : reject('cant do that');
    });
  }
  
  export async function PickFolderFor(key) {
    return new Promise(async (resolve, reject) => {
      const fo_result = await fs.getFolder();
      const _token = await fs.createPersistentToken(fo_result);
      localStorage.setItem(key, _token);
  
      resolve(fo_result);
    });
  }

  export async function insertSmartObject(entryobject) {
    await core
      .executeAsModal(
        async () => {
          await app
            .batchPlay(
              [
                {
                  _obj: 'placeEvent',
                  null: {
                    _path: await fs.createSessionToken(entryobject),
                    _kind: 'local',
                  },
                  linked: true,
                },
              ],
              {}
            )
            .catch((e) => console.log(e));
        },
        {commandName: 'insert smart object'}
      )
      .catch((e) => console.log(e));
  }
  export async function quickExecuteModal(callback, name) {
    return await core.executeAsModal(callback, {commandName: name});
  }
  async function findSmartObjectName(all_smartobject, layername) {
    return new Promise(async (resolve, reject) => {
      const numb_name = all_smartobject
        ?.map((so) => so.name)
        ?.map((psbfile) => {
          const filename = psbfile.replace('.psb', '').split('_');
          return parseInt(filename[filename.length - 1]);
        })
        .filter((n) => !isNaN(n));
  
      const num = Math.max(...numb_name);
      resolve(num == -Infinity ? `${layername}_0.psb` : `${layername}_${num + 1}.psb`);
    });
  }
  export function findNestedObject(entireObj, keyToFind) {
    let foundObj;
    JSON.stringify(entireObj, (_, nestedValue) => {
      if (nestedValue && nestedValue[keyToFind]) {
        foundObj = nestedValue;
      }
      return nestedValue;
    });
    return foundObj;
  }
  export async function SaveCurrentLayerAsSmartObject(so_token, all_smartobject, file_name) {
    const layer = app.activeDocument.activeLayers[0];
    if (!layer) return;
    const outfile_path = await quickExecuteModal(async () => {
      const new_name = (await findSmartObjectName(all_smartobject, file_name));
      
      layer.name = new_name;
      const new_so = await so_token.createFile(new_name, {overwrite: false});
      const new_session = fs.createSessionToken(new_so);
      const result = await action.batchPlay(
        [
          {
            _obj: 'newPlacedLayer',
          },
          {
            _obj: 'placedLayerConvertToLinked',
            _target: [
              {
                _ref: 'layer',
                _enum: 'ordinal',
                _value: 'targetEnum',
              },
            ],
            using: {
              _path: new_session,
              _kind: 'local',
            },
          },
        ],
        {}
      );
      console.log(result);
      const filepath = findNestedObject(result, '_path');
      return filepath?._path;
    }, 'layer name');
    return outfile_path;
  }

  export async function getSmartObjectNativePath(so_token, filename) {
    const result = await so_token.getEntry(filename + '.psb');
  
    return result.nativePath;
  }