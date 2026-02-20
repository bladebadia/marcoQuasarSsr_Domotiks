import ssrHandler from '../dist/ssr/server/server-entry.js';

export default async function handler(req, res) {
  console.log('Tipo:', typeof ssrHandler);
  console.log('Es función:', typeof ssrHandler === 'function');
  
  if (typeof ssrHandler === 'object') {
    console.log('Keys:', Object.keys(ssrHandler));
  }
  
  res.status(200).json({ 
    tipo: typeof ssrHandler,
    keys: typeof ssrHandler === 'object' ? Object.keys(ssrHandler) : null
  });
}