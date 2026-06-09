import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'kboq5jzm', 
  
  dataset: 'videos', 
  
  apiVersion: '2023-05-03', 
  useCdn: true, 
});