import React, { useEffect, useState } from 'react';
import CRUDPage, { FieldDef } from './CRUDPage';
import { dbService } from '../services/db';

export default function ManageCharacters() {
  const [novels, setNovels] = useState<any[]>([]);

  useEffect(() => {
    dbService.list('novels').then(setNovels);
  }, []);

  const fields: FieldDef[] = [
    { 
      name: 'model3DUrl', 
      label: 'Novel (Linked via Metadata)', 
      type: 'select', 
      options: novels.map(n => ({ value: n.id, label: n.title })),
      required: true
    },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'appearance', label: 'Appearance', type: 'textarea', required: false },
    { name: 'personality', label: 'Personality', type: 'textarea', required: false },
    { name: 'history', label: 'History', type: 'textarea', required: false },
    { name: 'relationships', label: 'Relationships', type: 'textarea', required: false },
    { name: 'image', label: 'Image', type: 'image', required: true },
  ];

  const columns = [
    { key: 'name', label: 'Name' },
  ];

  return <CRUDPage title="Characters" collectionName="characters" fields={fields} columns={columns} defaultValues={{ name: '', description: '', appearance: '', personality: '', history: '', relationships: '', image: '', model3DUrl: '' }} />;
}
