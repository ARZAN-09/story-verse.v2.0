import React, { useEffect, useState } from 'react';
import CRUDPage, { FieldDef } from './CRUDPage';
import { dbService } from '../services/db';

export default function ManageChapters() {
  const [novels, setNovels] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [arcs, setArcs] = useState<any[]>([]);

  useEffect(() => {
    dbService.list('novels').then(setNovels);
    dbService.list('volumes').then(setVolumes);
    dbService.list('arcs').then(setArcs);
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
          .map(v => ({ value: v.id, label: v.title })),
      required: false
    },
    { 
      name: 'arcId', 
      label: 'Arc', 
      type: 'select', 
      options: arcs
          .filter(a => formData?.volumeId ? a.volumeId === formData.volumeId : formData?.novelId ? a.novelId === formData.novelId : true)
          .map(a => ({ value: a.id, label: a.title })),
      required: false
    },
    { name: 'chapterNumber', label: 'Chapter Number', type: 'number', required: true },
    { name: 'title', label: 'Chapter Title', type: 'text', required: true },
    { name: 'content', label: 'Content (Large Editor - Markdown)', type: 'textarea', required: true },
  ];

  const columns = [
    { key: 'chapterNumber', label: 'Ch.' },
    { key: 'title', label: 'Title' },
  ];

  return <CRUDPage title="Chapters" collectionName="chapters" fields={fields} columns={columns} defaultValues={{ novelId: '', volumeId: '', arcId: '', title: '', content: '', chapterNumber: 1, createdAt: 0 }} />;
}
