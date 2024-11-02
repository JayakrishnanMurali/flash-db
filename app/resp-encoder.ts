enum RESPCommands {
  PING = "PING",
  ECHO = "ECHO",
}

export class RESPEncoder {
  encode(data: string[]): string {
    const cmd = data[0];

    switch (cmd.toUpperCase()) {
      case RESPCommands.PING:
        return this.serialize("PONG");
      case RESPCommands.ECHO:
        return this.serialize(data[1]);
      default:
        return this.serialize(new Error("Unknown command"));
    }
  }

  private serialize(data: any): string {
    if (typeof data === "string") {
      return `+${data}\r\n`;
    }

    if (data instanceof Error) {
      return `-${data.message}\r\n`;
    }

    if (typeof data === "number") {
      return `:${data}\r\n`;
    }

    if (data === null) {
      return "$-1\r\n";
    }

    if (Array.isArray(data)) {
      let result = `*${data.length}\r\n`;
      for (const item of data) {
        result += this.encode(item);
      }
      return result;
    }
    throw new Error("Invalid data type");
  }
}
