enum RESPCommands {
  PING = "PING",
  ECHO = "ECHO",
  SET = "SET",
  GET = "GET",
}

enum RESPAttributes {
  EXPIRY = "PX",
}

export class RESPEncoder {
  private store: Map<string, string> = new Map();

  constructor() {
    this.store = new Map();
  }

  encode(data: string[]): string {
    const cmd = data[0];
    const args = data.slice(1);

    switch (cmd.toUpperCase()) {
      case RESPCommands.PING:
        return this.serialize("PONG");
      case RESPCommands.ECHO:
        return this.serialize(args.join(" "));
      case RESPCommands.SET:
        return this.cmdSet(args);
      case RESPCommands.GET:
        return this.cmdGet(args);
      default:
        return this.serialize(new Error("Unknown command"));
    }
  }

  private cmdSet(data: string[]): string {
    if (data.length < 2) {
      return this.serialize(new Error("SET command requires 2 arguments"));
    }

    const key = data[0];
    const value = data[1];
    this.store.set(key, value);

    const hasExpiry =
      data.length === 4 && data[2].toUpperCase() === RESPAttributes.EXPIRY;
    const expiryTime = hasExpiry ? parseInt(data[3]) : null;

    if (expiryTime) {
      setTimeout(() => {
        this.store.delete(key);
      }, expiryTime);
    }

    return this.serialize("OK");
  }

  private cmdGet(data: string[]): string {
    if (data.length !== 1) {
      return this.serialize(new Error("GET command requires 1 argument"));
    }
    const key = data[0];
    const value = this.store.get(key) ?? null;

    return this.serialize(value);
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
