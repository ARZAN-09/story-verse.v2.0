import React, { useEffect, useState } from 'react';
import CRUDPage, { FieldDef } from './CRUDPage';
import { dbService } from '../services/db';

export default function ManageManhwa() {
  const [novels, setNovels] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);

  useEffect(() => {
    dbService.list('novels').then(setNovels);
    dbService.list('volumes').then(setVolumes);
  }, []);

  const fields = (formData: any): FieldDef[] => [
    { 
      name: 'novelId', 
      label: 'Novel / Manhwa Series', 
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
          .map(v => ({ value: v.id, label: v.title })),
      required: true
    },
    { name: 'chapterNumber', label: 'Chapter Number', type: 'number', required: true },
    { name: 'title', label: 'Chapter Title', type: 'text', required: true },
    { name: 'images', label: 'Chapter Images', type: 'images', required: true }
  ];

  const columns = [
    { key: 'chapterNumber', label: 'Ch.' },
    { key: 'title', label: 'Title' },
  ];

  return <CRUDPage title="Manhwa (Chapters)" collectionName="manhwa" fields={fields} columns={columns} defaultValues={{ novelId: '', volumeId: '', title: '', chapterNumber: 1, images: [] }} />;
}
