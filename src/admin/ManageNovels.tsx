import React from 'react';
import CRUDPage, { FieldDef } from './CRUDPage';

export default function ManageNovels() {
  const fields: FieldDef[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'author', label: 'Author', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'status', label: 'Status', type: 'select', options: [
       { value: 'Ongoing', label: 'Ongoing' },
       { value: 'Completed', label: 'Completed' },
       { value: 'Hiatus', label: 'Hiatus' },
       { value: 'Dropped', label: 'Dropped' }
    ]},
    { name: 'coverImage', label: 'Cover Image', type: 'image', required: true },
    { name: 'genres', label: 'Genres (Comma separated)', type: 'array' },
    { name: 'tags', label: 'Tags (Comma separated)', type: 'array' },
  ];

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'status', label: 'Status' },
    { key: 'genres', label: 'Genres' },
  ];

  return <CRUDPage title="Novels" collectionName="novels" fields={fields} columns={columns} defaultValues={{ title: '', author: '', status: 'Ongoing', description: '', coverImage: '', genres: [], tags: [], createdAt: 0 }} />;
}
