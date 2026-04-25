const net = require('net');
const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Port 5002 is still in use');
    process.exit(1);
  }
});

server.once('listening', () => {
  console.log('Port 5002 is free');
  server.close();
  process.exit(0);
});

server.listen(5002);
