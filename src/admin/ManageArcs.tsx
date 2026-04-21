import React, { useEffect, useState } from 'react';
import CRUDPage, { FieldDef } from './CRUDPage';
import { dbService } from '../services/db';

export default function ManageArcs() {
  const [novels, setNovels] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);

  useEffect(() => {
    dbService.list('novels').then(setNovels);
    dbService.list('volumes').then(setVolumes);
  }, []);

  const fields = (formData: any): FieldDef[] => [
    { 
      name: 'novelId', 
      label: 'Novel', 
      type: 'select', 
      options: novels.map(n => ({ value: n.id, label: n.title })),
      required: true
    },
    { 
      name: 'volumeId', 
      label: 'Volume', 
      type: 'select', 
      options: volumes
         .filter(v => formData?.novelId ? v.novelId === formData.novelId : true)
         .map(v => ({ value: v.id, label: `${v.title} (Vol ${v.volumeNumber})` })),
      required: true
    },
    { name: 'title', label: 'Arc Title', type: 'text', required: true },
  ];

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'novelId', label: 'Novel ID' },
  ];

  return <CRUDPage title="Arcs" collectionName="arcs" fields={fields} columns={columns} defaultValues={{ novelId: '', volumeId: '', title: '' }} />;
}
