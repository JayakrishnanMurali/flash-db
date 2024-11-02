import * as net from "net";
import { RESPParser } from "./resp-parser";
import { RESPEncoder } from "./resp-encoder";

const server: net.Server = net.createServer((connection: net.Socket) => {
  const parser = new RESPParser();
  const encoder = new RESPEncoder();

  connection.on("data", (data: Buffer) => {
    const parsedBuffer = parser.parse(data.toString());
    const result = encoder.encode(parsedBuffer);
    connection.write(result);
  });
});
server.listen(6379, "127.0.0.1");
