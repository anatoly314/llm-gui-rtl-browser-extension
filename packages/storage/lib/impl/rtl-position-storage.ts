import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

type PositionType = 'top' | 'right' | 'bottom' | 'left';

interface PositionStateType {
  position: PositionType;
}

type PositionStorageType = BaseStorageType<PositionStateType> & {
  setPosition: (position: PositionType) => Promise<void>;
};

const storage = createStorage<PositionStateType>(
  'rtl-position-storage-key',
  {
    position: 'top',
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const rtlPositionStorage: PositionStorageType = {
  ...storage,
  setPosition: async (position: PositionType) => {
    await storage.set({ position });
  },
};

export { rtlPositionStorage };
export type { PositionType, PositionStateType, PositionStorageType };
