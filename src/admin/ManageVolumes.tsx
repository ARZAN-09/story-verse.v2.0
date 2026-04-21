import React, { useEffect, useState } from 'react';
import CRUDPage, { FieldDef } from './CRUDPage';
import { dbService } from '../services/db';

export default function ManageVolumes() {
  const [novels, setNovels] = useState<any[]>([]);

  useEffect(() => {
    dbService.list('novels').then(setNovels);
  }, []);

  const fields: FieldDef[] = [
    { 
      name: 'novelId', 
      label: 'Novel', 
      type: 'select', 
      options: novels.map(n => ({ value: n.id, label: n.title })),
      required: true
    },
    { name: 'title', label: 'Volume Title', type: 'text', required: true },
    { name: 'volumeNumber', label: 'Volume Number', type: 'number', required: true },
  ];

  const columns = [
    { key: 'novelId', label: 'Novel ID' },
    { key: 'title', label: 'Title' },
    { key: 'volumeNumber', label: 'Number' },
  ];

  return <CRUDPage title="Volumes" collectionName="volumes" fields={fields} columns={columns} defaultValues={{ novelId: '', title: '', volumeNumber: 1 }} />;
}
