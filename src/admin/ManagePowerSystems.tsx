import React, { useEffect, useState } from 'react';
import CRUDPage, { FieldDef } from './CRUDPage';
import { dbService } from '../services/db';

export default function ManagePowerSystems() {
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
    { name: 'name', label: 'Stage / System Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'image', label: 'Image (Optional)', type: 'image' },
  ];

  const columns = [
    { key: 'name', label: 'Name' },
  ];

  return <CRUDPage title="Power Systems" collectionName="power_systems" fields={fields} columns={columns} defaultValues={{ name: '', description: '', image: '', model3DUrl: '' }} />;
}
