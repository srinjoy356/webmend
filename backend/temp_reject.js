fetch('http://localhost:3001/api/collectors/c_mswxou59gsluhekiy/heal/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'reject' })
}).then(r => r.json()).then(console.log).catch(console.error);
