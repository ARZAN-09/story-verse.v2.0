import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { UploadCloud, Loader2 } from 'lucide-react';

export type FieldDef = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'json' | 'select' | 'image' | 'array' | 'images';
  options?: { value: string; label: string }[];
  required?: boolean;
};

interface CRUDPageProps {
  title: string;
  collectionName: string;
  fields: FieldDef[] | ((formData: any) => FieldDef[]);
  columns: { key: string; label: string }[];
  defaultValues: any;
}

export default function CRUDPage({ title, collectionName, fields, columns, defaultValues }: CRUDPageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<any>(defaultValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const location = useLocation();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await dbService.list(collectionName);
      setItems(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [collectionName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let dataToSave = { ...formData };
      
      // Explicitly remove `id` to not break firestore.rules/supabase strict schema checks
      if (dataToSave.id !== undefined) {
         delete dataToSave.id;
      }
      
      // Explicitly remove `created_at` or `createdAt` as they are immutable and will trigger RLS lockouts on update
      if (editingId) {
         delete dataToSave.createdAt;
         delete dataToSave.created_at;
      } else {
         // Clean it up for creates as well, we let the database handle default timestamps
         delete dataToSave.createdAt;
         delete dataToSave.created_at;
      }
      
      const currentFields = typeof fields === 'function' ? fields(dataToSave) : fields;
      
      currentFields.forEach(f => {
        if (f.type === 'number') dataToSave[f.name] = Number(dataToSave[f.name]);
        if (f.type === 'json' && typeof dataToSave[f.name] === 'string') {
          try { dataToSave[f.name] = JSON.parse(dataToSave[f.name] || '{}'); } catch (err) {}
        }
        if ((f.type === 'array' || f.type === 'images') && typeof dataToSave[f.name] === 'string') {
           dataToSave[f.name] = dataToSave[f.name].split(',').map((s:string) => s.trim()).filter(Boolean);
        }
      });

      if (editingId) {
        await dbService.update(collectionName, editingId, dataToSave);
      } else {
        await dbService.create(collectionName, dataToSave);
      }
      setFormOpen(false);
      fetchItems();
    } catch (e: any) {
      console.error("Save error details: ", e);
      alert('Error saving data: ' + (e.message || String(e)));
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await dbService.remove(collectionName, deleteConfirmId);
      setDeleteConfirmId(null);
      fetchItems();
    }
  };

  const openEdit = (item: any) => {
    let data = { ...item };
    const currentFields = typeof fields === 'function' ? fields(data) : fields;
    currentFields.forEach(f => {
      if (f.type === 'json' && typeof data[f.name] === 'object') {
        data[f.name] = JSON.stringify(data[f.name], null, 2);
      }
      if ((f.type === 'array' || f.type === 'images') && Array.isArray(data[f.name])) {
        data[f.name] = data[f.name].join(', ');
      }
    });
    setFormData(data);
    setEditingId(item.id);
    setFormOpen(true);
  };

  const openCreate = () => {
    setFormData(defaultValues);
    setEditingId(null);
    setFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, isMultiple: boolean = false) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingField(fieldName);
    try {
      if (isMultiple) {
        const files = Array.from(e.target.files);
        const uploadPromises = files.map(async (file) => {
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
          const { error } = await supabase.storage.from('uploads').upload(fileName, file);
          if (error) throw error;
          const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
          return data.publicUrl;
        });
        const urls = await Promise.all(uploadPromises);
        
        setFormData((prev: any) => {
          const currentVal = prev[fieldName];
          const currentArray = Array.isArray(currentVal) ? currentVal : (typeof currentVal === 'string' && currentVal ? currentVal.split(',').map(s=>s.trim()) : []);
          return { ...prev, [fieldName]: [...currentArray, ...urls].join(', ') };
        });
      } else {
        const file = e.target.files[0];
        const fileName = `${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('uploads').upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
        setFormData((prev: any) => ({ ...prev, [fieldName]: data.publicUrl }));
      }
    } catch (err: any) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  useEffect(() => {
    if (items.length > 0 && location.search) {
      const params = new URLSearchParams(location.search);
      const editId = params.get('edit');
      if (editId) {
        const item = items.find(i => i.id === editId);
        if (item && editingId !== editId) {
          openEdit(item);
        }
      }
    }
  }, [items, location.search, editingId]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#1f222b] pb-6">
        <h1 className="text-2xl font-black uppercase tracking-widest text-[#e1e1e1]">{title}</h1>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-lg uppercase tracking-wider transition-all shadow-lg hover:shadow-primary/20">
          Create New
        </button>
      </div>

      {formOpen ? (
        <form onSubmit={handleSubmit} className="bg-[#12141a] p-6 sm:p-8 rounded-2xl border border-bg-elevated/70 mb-10 shadow-xl">
          <h2 className="text-sm font-bold text-primary mb-6 uppercase tracking-widest flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             {editingId ? 'Edit Record' : 'Create Record'}
          </h2>
          <div className="flex flex-col gap-6">
            {(typeof fields === 'function' ? fields(formData) : fields).map(field => (
              <div key={field.name}>
                <label className="block text-xs font-bold text-[#888] uppercase tracking-wider mb-2 pl-1">{field.label}</label>
                {field.type === 'textarea' || field.type === 'json' ? (
                  <textarea
                    value={formData[field.name] ?? ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full bg-[#0b0c10] border border-[#1f222b] rounded-xl px-4 py-3 text-[#e1e1e1] hover:border-[#333] focus:border-primary outline-none focus:ring-1 focus:ring-primary/50 font-mono text-sm transition-all"
                    rows={field.type === 'json' ? 6 : 10}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] ?? ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full bg-[#0b0c10] border border-[#1f222b] rounded-xl px-4 py-3 text-[#e1e1e1] hover:border-[#333] focus:border-primary outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : field.type === 'image' || field.type === 'images' ? (
                  <div className="space-y-4">
                    {formData[field.name] && field.type === 'image' && (
                      <div className="w-32 h-32 rounded-xl border border-[#333] overflow-hidden bg-[#0b0c10] shadow-md">
                         <img src={formData[field.name]} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {formData[field.name] && field.type === 'images' && (
                      <div className="flex flex-wrap gap-3">
                         {(Array.isArray(formData[field.name]) ? formData[field.name] : (typeof formData[field.name] === 'string' ? formData[field.name].split(',').map((s:string)=>s.trim()) : [])).map((url: string, i: number) => url ? (
                           <div key={i} className="w-16 h-16 rounded-xl border border-[#333] overflow-hidden bg-[#0b0c10] shadow-md">
                             <img src={url} alt="Preview" className="w-full h-full object-cover" />
                           </div>
                         ) : null)}
                         
                         {/* Built-in Preview Drawer Trigger */}
                         {formData[field.name] && formData[field.name].length > 0 && (
                            <button
                               type="button"
                               onClick={(e) => {
                                 e.preventDefault();
                                 const previewUrls = Array.isArray(formData[field.name]) ? formData[field.name] : formData[field.name].split(',').map((s:string)=>s.trim());
                                 
                                 // Simple window popup for previewing
                                 const newWin = window.open('', '_blank');
                                 if(newWin) {
                                   newWin.document.write(`
                                     <html><head><title>Manhwa Preview</title><style>body { background: #0b0c10; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 4px; }</style></head><body>
                                     ${previewUrls.filter(Boolean).map((u:string) => `<img src="${u}" style="max-width: 800px; width: 100%; border-radius: 8px;" />`).join('')}
                                     </body></html>
                                   `);
                                 }
                               }}
                               className="h-16 px-4 bg-[#0b0c10] border border-[#1f222b] hover:bg-[#1a1c23] hover:text-[#3498db] transition-colors rounded-xl flex items-center justify-center text-xs font-bold text-[#888] shadow-sm uppercase tracking-widest"
                            >
                               View Full
                            </button>
                         )}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={formData[field.name] || ''}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                        placeholder={field.type === 'images' ? "Image URLs (comma separated)" : "Image URL"}
                        className="flex-1 bg-[#0b0c10] border border-[#1f222b] rounded-xl px-4 py-3 text-[#e1e1e1] hover:border-[#333] focus:border-primary outline-none focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                      />
                      <label className="cursor-pointer bg-[#0b0c10] border border-[#1f222b] hover:bg-[#1a1c23] hover:border-[#333] text-primary px-5 py-3 rounded-xl flex items-center justify-center transition-all shadow-sm">
                         {uploadingField === field.name ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                         <input 
                           type="file" 
                           accept="image/*" 
                           multiple={field.type === 'images'}
                           className="hidden" 
                           onChange={(e) => handleImageUpload(e, field.name, field.type === 'images')} 
                           disabled={uploadingField === field.name} 
                         />
                      </label>
                    </div>
                  </div>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={formData[field.name] ?? ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full bg-[#0b0c10] border border-[#1f222b] rounded-xl px-4 py-3 text-[#e1e1e1] hover:border-[#333] focus:border-primary outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-10 p-4 bg-[#0b0c10]/50 rounded-xl border border-transparent">
            <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#888] hover:bg-[#1a1c23] hover:text-white rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-primary/20">Save Record</button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto bg-[#12141a] border border-[#1f222b] rounded-2xl shadow-xl">
        <table className="w-full text-left text-sm text-[#a0a0a0]">
          <thead className="bg-[#0b0c10] text-[#777] uppercase font-bold text-[10px] tracking-widest border-b border-[#1f222b]">
            <tr>
              {columns.map(c => <th key={c.key} className="px-6 py-5 whitespace-nowrap">{c.label}</th>)}
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f222b]/50">
            {loading ? (
              <tr><td colSpan={columns.length + 1} className="p-12 text-center text-xs">Loading records...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="p-12 text-center text-xs font-medium text-[#666]">No records found.</td></tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#1a1c23]/50 transition-colors group">
                  {columns.map((c, colIdx) => (
                    <td key={c.key} className="px-6 py-4 truncate max-w-[200px] align-middle">
                      {colIdx === 0 ? (
                        <span className="text-[#e1e1e1] font-bold">{String(item[c.key] || '')}</span>
                      ) : (
                        String(item[c.key] || '')
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <button onClick={() => openEdit(item)} className="px-3 py-1.5 bg-[#1a1c23] hover:bg-[#3498db]/10 border border-[#333] hover:border-[#3498db]/50 text-[#3498db] rounded text-[10px] font-bold uppercase tracking-widest transition-all">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-[#1a1c23] hover:bg-red-500/10 border border-[#333] hover:border-red-500/50 text-red-500 rounded text-[10px] font-bold uppercase tracking-widest transition-all">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#14161c] border border-bg-elevated p-6 rounded-xl max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">Confirm Action</h3>
            <p className="text-text-muted text-sm mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="px-4 py-2 text-xs font-bold uppercase text-text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 text-xs font-bold uppercase bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
