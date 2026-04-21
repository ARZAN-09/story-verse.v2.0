import { supabase } from './supabase';

const VIRTUAL_TABLES: Record<string, { table: string, defaultProps: any }> = {
  power_systems: { table: 'characters', defaultProps: { 'stats': { _type: 'power_system' } } },
  world_systems: { table: 'characters', defaultProps: { 'stats': { _type: 'world_system' } } },
};

export const dbService = {
  async list(collectionName: string, filters: Record<string, any> = {}): Promise<any[]> {
    let targetTable = collectionName;
    let queryFilters = { ...filters };

    if (VIRTUAL_TABLES[collectionName]) {
      targetTable = VIRTUAL_TABLES[collectionName].table;
      queryFilters = { ...queryFilters, ...VIRTUAL_TABLES[collectionName].defaultProps };
    } else if (collectionName === 'characters') {
      // Filter out virtual table entries when querying characters normally
      queryFilters = { ...queryFilters, 'stats->>_type': 'is.null' };
    }

    let query = supabase.from(targetTable).select('*');
    for (const [key, value] of Object.entries(queryFilters)) {
      if (key === 'stats->>_type' && value === 'is.null') {
         // PostgREST check for null JSON key
         query = query.is('stats->>_type', null);
      } else if (key === 'stats') {
         query = query.contains('stats', value);
      } else {
         query = query.eq(key, value);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    
    // Inflate virtual text columns for actual characters
    if (collectionName === 'characters' && data) {
        data.forEach(d => {
           if (d.stats) {
               d.appearance = d.stats.appearance;
               d.relationships = d.stats.relationships;
               d.personality = d.stats.personality;
               d.history = d.stats.history;
           }
        });
    }
    return data || [];
  },
  
  async get(collectionName: string, id: string): Promise<any> {
    const targetTable = VIRTUAL_TABLES[collectionName] ? VIRTUAL_TABLES[collectionName].table : collectionName;
    const { data, error } = await supabase.from(targetTable).select('*').eq('id', id).single();
    if (error) throw error;
    
    if (collectionName === 'characters' && data && data.stats) {
       data.appearance = data.stats.appearance;
       data.relationships = data.stats.relationships;
       data.personality = data.stats.personality;
       data.history = data.stats.history;
    }
    return data;
  },

  async create(collectionName: string, data: any, id?: string): Promise<string> {
    const payload = { ...data };
    
    if (VIRTUAL_TABLES[collectionName]) {
      payload.stats = { ...(payload.stats || {}), ...VIRTUAL_TABLES[collectionName].defaultProps.stats };
    } else if (collectionName === 'characters') {
      if ('appearance' in payload || 'relationships' in payload || 'personality' in payload || 'history' in payload || !payload.stats) {
         payload.stats = { 
             ...(payload.stats || {}), 
             appearance: payload.appearance, 
             relationships: payload.relationships,
             personality: payload.personality,
             history: payload.history
         };
         delete payload.appearance;
         delete payload.relationships;
         delete payload.personality;
         delete payload.history;
      }
    }

    if (id) {
      payload.id = id;
    } else {
      delete payload.id; // ensure database generates id
    }
    
    const targetTable = VIRTUAL_TABLES[collectionName] ? VIRTUAL_TABLES[collectionName].table : collectionName;
    const { data: result, error } = await supabase.from(targetTable).insert(payload).select().single();
    if (error) throw error;
    return result.id;
  },

  async update(collectionName: string, id: string, data: any): Promise<void> {
    const targetTable = VIRTUAL_TABLES[collectionName] ? VIRTUAL_TABLES[collectionName].table : collectionName;
    const payload = { ...data };
    
    if (collectionName === 'characters' && !VIRTUAL_TABLES[collectionName]) {
      payload.stats = { 
          ...(payload.stats || {}), 
          appearance: payload.appearance, 
          relationships: payload.relationships,
          personality: payload.personality,
          history: payload.history
      };
      delete payload.appearance;
      delete payload.relationships;
      delete payload.personality;
      delete payload.history;
    }

    const { error } = await supabase.from(targetTable).update(payload).eq('id', id);
    if (error) throw error;
  },
  
  async remove(collectionName: string, id: string): Promise<void> {
    const targetTable = VIRTUAL_TABLES[collectionName] ? VIRTUAL_TABLES[collectionName].table : collectionName;
    const { error } = await supabase.from(targetTable).delete().eq('id', id);
    if (error) throw error;
  }
};
