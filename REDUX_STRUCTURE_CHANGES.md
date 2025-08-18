# Redux Structure Changes for Campaign Data

## Overview

The Redux store structure for campaign data has been simplified to store campaign data as a single object instead of indexing by campaign ID. This change aligns with the "always one campaign details only" requirement and provides better performance and memory efficiency.

## Changes Made

### 1. Redux State Structure

#### Before (Indexed by Campaign ID)
```javascript
{
  meta: {
    campaignData: {
      'campaign-1': { /* campaign data */ },
      'campaign-2': { /* campaign data */ },
      'campaign-3': { /* campaign data */ }
    },
    loading: {
      campaignData: {
        'campaign-1': false,
        'campaign-2': true,
        'campaign-3': false
      }
    },
    errors: {
      campaignData: {
        'campaign-1': null,
        'campaign-2': 'Error message',
        'campaign-3': null
      }
    }
  }
}
```

#### After (Single Object)
```javascript
{
  meta: {
    campaignData: { /* current campaign data */ },
    loading: {
      campaignData: false // Single boolean
    },
    errors: {
      campaignData: null // Single error state
    }
  }
}
```

### 2. Initial State Changes

#### Before
```javascript
const initialState = {
  campaignData: {}, // Object indexed by campaignId
  loading: {
    campaignData: {} // Object indexed by campaignId
  },
  errors: {
    campaignData: {} // Object indexed by campaignId
  }
};
```

#### After
```javascript
const initialState = {
  campaignData: null, // Single object
  loading: {
    campaignData: false // Single boolean
  },
  errors: {
    campaignData: null // Single error state
  }
};
```

### 3. Reducer Changes

#### Before
```javascript
.addCase(fetchMetaCampaignData.fulfilled, (state, action) => {
  const { campaignId, data } = action.payload;
  state.campaignData[campaignId] = data; // Store by campaignId
  state.loading.campaignData[campaignId] = false;
  state.errors.campaignData[campaignId] = null;
})
```

#### After
```javascript
.addCase(fetchMetaCampaignData.fulfilled, (state, action) => {
  const { data } = action.payload;
  state.campaignData = data; // Store as single object
  state.loading.campaignData = false;
  state.errors.campaignData = null;
})
```

### 4. Selector Changes

#### Before
```javascript
export const selectMetaCampaignData = (state, campaignId) => {
  return state.meta.campaignData[campaignId] || null;
};
```

#### After
```javascript
export const selectMetaCampaignData = (state) => {
  return state.meta.campaignData || null;
};
```

### 5. Hook Changes

#### Before
```javascript
const campaignData = useSelector(state => 
  campaignId ? selectMetaCampaignData(state, campaignId) : null
);
```

#### After
```javascript
const campaignData = useSelector(state => 
  campaignId ? selectMetaCampaignData(state) : null
);
```

## Benefits

### 1. **Simplified State Management**
- No need to track multiple campaigns in Redux
- Cleaner state structure
- Easier to debug and maintain

### 2. **Better Performance**
- Faster selectors (no object lookup by campaignId)
- Reduced memory usage
- Fewer re-renders

### 3. **Memory Efficiency**
- Only one campaign object in memory at a time
- Automatic cleanup when switching campaigns
- No accumulation of unused campaign data

### 4. **Consistency with Single Campaign Approach**
- Aligns with "always one campaign details only" requirement
- Eliminates potential data conflicts
- Simpler data flow

## Migration Impact

### Components Using the Hook
- **No changes required** - The hook interface remains the same
- Components continue to work as before
- All existing functionality preserved

### Direct Redux Usage
- **Minor changes required** - Selectors no longer need campaignId parameter
- Update any direct selector calls to remove campaignId parameter
- Example: `selectMetaCampaignData(state, campaignId)` → `selectMetaCampaignData(state)`

### State Structure
- **Breaking change** - State structure is different
- Any code directly accessing `state.meta.campaignData[campaignId]` needs to be updated
- Should use selectors instead of direct state access

## Example Migration

### Before
```javascript
// Direct state access
const campaignData = state.meta.campaignData[campaignId];

// Selector usage
const campaignData = selectMetaCampaignData(state, campaignId);
```

### After
```javascript
// Direct state access
const campaignData = state.meta.campaignData;

// Selector usage
const campaignData = selectMetaCampaignData(state);
```

## Testing Considerations

### 1. **State Structure Tests**
- Update tests that verify state structure
- Remove tests for campaignId indexing
- Add tests for single object storage

### 2. **Selector Tests**
- Update selector tests to remove campaignId parameter
- Test single object retrieval
- Verify null handling

### 3. **Hook Tests**
- Hook tests should continue to work without changes
- Verify campaign switching behavior
- Test data clearing functionality

## Conclusion

The simplified Redux structure provides better performance, memory efficiency, and consistency with the single campaign approach. The changes are mostly internal to the Redux layer, with minimal impact on components using the `useCampaignData` hook.

This approach ensures that only one campaign's data is stored in Redux at any given time, eliminating the complexity of managing multiple campaigns and providing a cleaner, more maintainable codebase.
