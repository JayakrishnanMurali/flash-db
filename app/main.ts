import * as net from "net";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    connection.write("+PONG\r\n");
  });
});
server.listen(6379, "127.0.0.1");
