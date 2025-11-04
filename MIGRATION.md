# Storage Migration Guide

## Overview

Version 0.8.0 introduces a major architectural change: migration from unified storage to provider-specific storage. This document explains the migration process, what changes for users, and how to handle edge cases.

## Why Migrate?

### Previous Architecture (v1)
- **Single unified storage**: All settings for both Claude.ai and ChatGPT stored in one namespace
- **Storage key**: `'chat-rtl-storage-key'`
- **Data structure**: Mixed Claude and ChatGPT settings in one object
```typescript
{
  chats: {
    "some-chat-uuid": {
      isRTL: boolean,              // Claude-specific
      isChatInputRTL: boolean,     // Claude-specific
      isMainContentRTL: boolean,   // Claude-specific
      isChatGPTKatexRTL: boolean,  // ChatGPT-specific
      isChatGPTInputRTL: boolean,  // ChatGPT-specific
      direction: 'ltr' | 'rtl',
      textAlign: 'left' | 'right' | 'center'
    }
  }
}
```

**Problems**:
1. Tight coupling between providers
2. Adding new providers required modifying shared settings interface
3. Risk of data collision (same chat UUID on different platforms)
4. Difficult to maintain provider-specific logic

### New Architecture (v2)
- **Separate storage namespaces**: Each provider has its own isolated storage
- **Claude storage key**: `'claude_chats_storage'`
- **ChatGPT storage key**: `'chatgpt_chats_storage'`
- **Clean separation**: Only relevant settings stored per provider

```typescript
// Claude storage
{
  chats: {
    "some-chat-uuid": {
      isRTL: boolean,
      isChatInputRTL: boolean,
      isMainContentRTL: boolean,
      direction: 'ltr' | 'rtl',
      textAlign: 'left' | 'right' | 'center'
    }
  }
}

// ChatGPT storage
{
  chats: {
    "another-chat-uuid": {
      isChatGPTKatexRTL: boolean,
      isChatGPTInputRTL: boolean
    }
  }
}
```

**Benefits**:
1. Complete isolation between providers
2. Adding new providers (Gemini, Perplexity) requires zero changes to existing code
3. No risk of data collision
4. Cleaner codebase with better separation of concerns
5. Independent storage quotas per provider

## Migration Process

### Automatic Migration

The migration runs **automatically** on first load after upgrading to v0.8.0+:

1. **Detection**: Extension checks if migration already completed via `'storage_migration_v1'` key
2. **Skip if done**: If migration flag is set, skip entire process
3. **Read old storage**: Reads all data from `'chat-rtl-storage-key'`
4. **Separate settings**:
   - Extracts Claude-specific fields (`isRTL`, `isChatInputRTL`, `isMainContentRTL`, `direction`, `textAlign`)
   - Extracts ChatGPT-specific fields (`isChatGPTKatexRTL`, `isChatGPTInputRTL`)
5. **Write new storages**:
   - Writes Claude settings to `'claude_chats_storage'`
   - Writes ChatGPT settings to `'chatgpt_chats_storage'`
6. **Mark complete**: Sets migration flag with timestamp
7. **Preserve old data**: Old storage remains intact for potential rollback

### Migration Triggers

Migration is triggered in:
- **Content script**: When RTL control panel loads (`pages/content-ui/src/App.tsx`)
- **Background script**: On extension startup (`chrome-extension/src/background/index.ts`)

This ensures migration happens regardless of how user interacts with extension.

### User Experience

**What users see**:
- No UI interruption
- Settings preserved exactly as they were
- Extension continues working immediately after upgrade

**What users don't see**:
- Migration console logs (only visible in DevTools)
- Storage restructuring happening behind the scenes
- Old storage being preserved

### Migration Code

Location: `packages/storage/lib/migrations/storage-migration.ts`

Key function:
```typescript
export const migrateStorage = async (): Promise<void> => {
  // Check if already migrated
  const migrationState = await migrationStorage.get();
  if (migrationState.migrated) {
    console.debug('[Storage Migration] Already migrated, skipping');
    return;
  }

  // Read old unified storage
  const oldData = await chrome.storage.local.get(OLD_STORAGE_KEY);

  // Separate and write to new storages
  // ... migration logic ...

  // Mark as complete
  await migrationStorage.set({
    migrated: true,
    migratedAt: new Date().toISOString(),
  });
}
```

## Storage Structure Comparison

### Before (v1)

Chrome Local Storage:
```
{
  "chat-rtl-storage-key": {
    "chats": {
      "claude-chat-123": {
        "isRTL": true,
        "isChatInputRTL": false,
        "isMainContentRTL": true,
        "isChatGPTKatexRTL": false,
        "isChatGPTInputRTL": false,
        "direction": "rtl",
        "textAlign": "right"
      },
      "chatgpt-chat-456": {
        "isRTL": false,
        "isChatInputRTL": false,
        "isMainContentRTL": false,
        "isChatGPTKatexRTL": true,
        "isChatGPTInputRTL": true,
        "direction": "ltr",
        "textAlign": "left"
      }
    }
  },
  "rtl-position-storage-key": {
    "position": "right"
  }
}
```

### After (v2)

Chrome Local Storage:
```
{
  "claude_chats_storage": {
    "chats": {
      "claude-chat-123": {
        "isRTL": true,
        "isChatInputRTL": false,
        "isMainContentRTL": true,
        "direction": "rtl",
        "textAlign": "right"
      }
    }
  },
  "chatgpt_chats_storage": {
    "chats": {
      "chatgpt-chat-456": {
        "isChatGPTKatexRTL": true,
        "isChatGPTInputRTL": true
      }
    }
  },
  "rtl-position-storage-key": {
    "position": "right"
  },
  "storage_migration_v1": {
    "migrated": true,
    "migratedAt": "2025-11-04T12:34:56.789Z"
  },
  "chat-rtl-storage-key": {
    // Old storage preserved for rollback
  }
}
```

## Edge Cases and Handling

### Case 1: Empty Old Storage
**Scenario**: Fresh install, no previous data

**Handling**:
```typescript
if (!oldState || !oldState.chats || Object.keys(oldState.chats).length === 0) {
  console.log('[Storage Migration] No old data found, marking as migrated');
  await migrationStorage.set({ migrated: true, migratedAt: new Date().toISOString() });
  return;
}
```

**Result**: Migration marked complete immediately, no data to transfer.

### Case 2: Mixed Settings
**Scenario**: Chat UUID has both Claude and ChatGPT settings (shouldn't happen but possible)

**Handling**:
```typescript
// Extract Claude-specific fields
if (settings.isRTL || settings.isChatInputRTL || settings.isMainContentRTL) {
  claudeChats[chatId] = { /* Claude settings */ };
}

// Extract ChatGPT-specific fields
if (settings.isChatGPTKatexRTL || settings.isChatGPTInputRTL) {
  chatgptChats[chatId] = { /* ChatGPT settings */ };
}
```

**Result**: Settings split into both storages, each provider sees only relevant settings.

### Case 3: Migration Failure
**Scenario**: Error during migration (network issue, storage quota exceeded, etc.)

**Handling**:
```typescript
try {
  // ... migration logic ...
} catch (error) {
  console.error('[Storage Migration] Migration failed:', error);
  // Don't mark as migrated - will retry next time
}
```

**Result**: Migration will retry on next extension load until successful.

### Case 4: Settings Only for One Provider
**Scenario**: User only used Claude.ai or only used ChatGPT

**Handling**:
```typescript
if (claudeCount > 0) {
  await claudeChatStorage.set({ chats: claudeChats });
  console.log(`[Storage Migration] Migrated ${claudeCount} Claude chat settings`);
}

if (chatgptCount > 0) {
  await chatgptChatStorage.set({ chats: chatgptChats });
  console.log(`[Storage Migration] Migrated ${chatgptCount} ChatGPT chat settings`);
}
```

**Result**: Only relevant provider storage is populated.

### Case 5: Corrupted Old Storage
**Scenario**: Old storage has invalid data structure

**Handling**: Migration skips invalid entries, logs errors, marks as complete to prevent infinite retry loop.

## Rollback Strategy

If issues arise after migration:

### Option 1: Manual Rollback (Developer)

1. Open DevTools Console on Claude.ai or ChatGPT
2. Run rollback script:
```javascript
// Reset migration flag
await chrome.storage.local.set({
  'storage_migration_v1': { migrated: false }
});

// Clear new storages
await chrome.storage.local.remove(['claude_chats_storage', 'chatgpt_chats_storage']);

// Reload extension
chrome.runtime.reload();
```

3. Downgrade to v0.7.x
4. Old storage will be used again

### Option 2: Complete Reset (User)

1. Right-click extension icon → "Manage Extension"
2. Scroll to "Site Settings"
3. Clear all data
4. Reload extension
5. Fresh start with new architecture

## Testing Migration

### For Developers

Test migration locally:

```javascript
// Reset migration for testing
import { resetMigration } from '@extension/storage';
await resetMigration();

// Manually trigger migration
import { migrateStorage } from '@extension/storage';
await migrateStorage();

// Check migration status
import { isMigrationComplete } from '@extension/storage';
const complete = await isMigrationComplete();
console.log('Migration complete:', complete);
```

### Test Scenarios

1. **Fresh install**: Verify no errors, migration marked complete immediately
2. **Upgrade with Claude data only**: Verify Claude settings migrated correctly
3. **Upgrade with ChatGPT data only**: Verify ChatGPT settings migrated correctly
4. **Upgrade with both**: Verify settings separated correctly
5. **Multiple chats**: Verify all chats migrated with correct UUIDs
6. **"new" temp key**: Verify temporary settings handled correctly
7. **Migration failure**: Verify retry works on next load

## Monitoring

### Console Logs

Migration logs to console with `[Storage Migration]` prefix:

Success logs:
```
[Storage Migration] Starting migration from unified to platform-specific storage...
[Storage Migration] Found 15 chat settings to migrate
[Storage Migration] Migrated 10 Claude chat settings
[Storage Migration] Migrated 5 ChatGPT chat settings
[Storage Migration] Migration completed successfully
```

Skip logs:
```
[Storage Migration] Already migrated, skipping
```

Error logs:
```
[Storage Migration] Migration failed: [error details]
```

### Verifying Migration

Check Chrome storage:
1. Open DevTools on Claude.ai or ChatGPT
2. Application tab → Storage → Local Storage → Extension ID
3. Look for keys:
   - `storage_migration_v1` should have `migrated: true`
   - `claude_chats_storage` should have Claude settings
   - `chatgpt_chats_storage` should have ChatGPT settings
   - `chat-rtl-storage-key` should still exist (preserved for rollback)

## FAQ

### Will my settings be lost?
No. Migration preserves all settings and transfers them to the appropriate provider storage.

### Can I downgrade after migration?
Yes. Old storage is preserved, so downgrading to v0.7.x will work with your previous settings.

### What if migration fails?
Migration will retry on next extension load. If issues persist, you can manually reset and start fresh.

### Does this affect performance?
No. Migration runs once on first load after upgrade. After that, separate storages may actually improve performance slightly.

### Will this happen again for future providers?
No. The provider-specific architecture is designed to accommodate new providers without requiring storage migrations.

### Can I manually trigger migration?
Yes, developers can use `migrateStorage()` function from `@extension/storage` package.

### What happens to "new" chat settings during migration?
The "new" temporary key is migrated if it exists. After migration, each provider manages its own "new" key independently.

### Is there data size limit?
Chrome Local Storage has a limit (usually 10MB per extension). Separate storages don't increase this limit, but settings are now more efficiently organized.

## Technical Notes

### Migration State Storage

The migration flag is stored separately to ensure reliable tracking:

```typescript
const migrationStorage = createStorage<MigrationState>(
  'storage_migration_v1',
  { migrated: false },
  { storageEnum: StorageEnum.Local, liveUpdate: false }
);
```

Key: `'storage_migration_v1'`
Purpose: Tracks whether migration completed
Structure:
```typescript
{
  migrated: boolean;
  migratedAt?: string; // ISO timestamp
}
```

### Legacy Storage Preservation

Old storage at `'chat-rtl-storage-key'` is **intentionally preserved** (not deleted) to allow:
1. Rollback to previous versions
2. Data recovery if issues arise
3. Manual inspection and verification

To clean up old storage after confirming migration success:
```javascript
await chrome.storage.local.remove('chat-rtl-storage-key');
```

### Provider-Specific Migration Logic

Each provider's migration checks for non-default values before creating storage entries:

```typescript
// Only migrate if settings have non-default values
if (settings.isRTL || settings.isChatInputRTL || settings.isMainContentRTL) {
  // Migrate to Claude storage
}

if (settings.isChatGPTKatexRTL || settings.isChatGPTInputRTL) {
  // Migrate to ChatGPT storage
}
```

This prevents unnecessary storage entries for chats that never had settings modified.

## Timeline

- **v0.7.x and earlier**: Unified storage architecture
- **v0.8.0**: Provider-specific storage with automatic migration
- **Future versions**: New providers added without storage migrations

## Support

If you encounter migration issues:

1. Check console logs in DevTools
2. Verify storage structure in Application tab
3. Try manual rollback if needed
4. Report issues with:
   - Extension version
   - Browser and OS
   - Console logs
   - Storage state before/after migration

## Related Files

- Migration implementation: `/packages/storage/lib/migrations/storage-migration.ts`
- Claude storage: `/packages/storage/lib/providers/claude-storage.ts`
- ChatGPT storage: `/packages/storage/lib/providers/chatgpt-storage.ts`
- Legacy storage: `/packages/storage/lib/impl/chat-rtl-storage.ts`
- Architecture docs: `/CLAUDE.md` (see "Storage System" section)
