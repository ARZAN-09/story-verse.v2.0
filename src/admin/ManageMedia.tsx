import React from 'react';
import CRUDPage, { FieldDef } from './CRUDPage';

export default function ManageMedia() {
  const fields: FieldDef[] = [
    { name: 'type', label: 'Type', type: 'select', options: [{value: 'trailer', label: 'Trailer'}, {value: 'animation', label: 'Animation'}], required: true },
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'videoUrl', label: 'Video URL (YouTube/Embed)', type: 'text', required: true },
    { name: 'thumbnail', label: 'Thumbnail Image', type: 'image', required: true },
  ];

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
  ];

  return <CRUDPage title="Media" collectionName="media" fields={fields} columns={columns} defaultValues={{ type: 'trailer', title: '', videoUrl: '', thumbnail: '' }} />;
}
