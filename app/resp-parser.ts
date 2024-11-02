enum RESPType {
  SimpleString = "+",
  Error = "-",
  Integer = ":",
  BulkString = "$",
  Array = "*",
}

class RESPParser {
  private buffer: string;

  constructor() {
    this.buffer = "";
  }

  parse(data: string): any {
    this.buffer += data;
    const result = this.parseNext();
    this.buffer = "";
    return result;
  }

  private parseNext(): any {
    if (this.buffer.length === 0) return null;

    const type = this.buffer[0];
    this.buffer = this.buffer.slice(1);

    switch (type) {
      case RESPType.SimpleString:
        return this.parseSimpleString();
      case RESPType.Error:
        return this.parseError();
      case RESPType.Integer:
        return this.parseInteger();
      case RESPType.BulkString:
        return this.parseBulkString();
      case RESPType.Array:
        return this.parseArray();
      default:
        throw new Error(`Unknown RESP type: ${type}`);
    }
  }

  private parseSimpleString(): string {
    const endIdx = this.buffer.indexOf("\r\n");
    if (endIdx === -1) throw new Error("Invalid Simple String");
    const result = this.buffer.slice(0, endIdx);
    this.buffer = this.buffer.slice(endIdx + 2);
    return result;
  }

  private parseError(): Error {
    const endIdx = this.buffer.indexOf("\r\n");
    if (endIdx === -1) throw new Error("Invalid Error");
    const result = this.buffer.slice(0, endIdx);
    this.buffer = this.buffer.slice(endIdx + 2);
    return new Error(result);
  }

  private parseInteger(): number {
    const endIdx = this.buffer.indexOf("\r\n");
    if (endIdx === -1) throw new Error("Invalid Integer");
    const result = parseInt(this.buffer.slice(0, endIdx), 10);
    this.buffer = this.buffer.slice(endIdx + 2);
    return result;
  }

  private parseBulkString(): string | null {
    const lengthEndIdx = this.buffer.indexOf("\r\n");
    if (lengthEndIdx === -1) throw new Error("Invalid Bulk String length");

    const length = parseInt(this.buffer.slice(0, lengthEndIdx), 10);
    this.buffer = this.buffer.slice(lengthEndIdx + 2);

    if (length === -1) return null;

    const result = this.buffer.slice(0, length);
    this.buffer = this.buffer.slice(length + 2);
    return result;
  }

  private parseArray(): any[] {
    const lengthEndIdx = this.buffer.indexOf("\r\n");
    if (lengthEndIdx === -1) throw new Error("Invalid Array length");

    const length = parseInt(this.buffer.slice(0, lengthEndIdx), 10);
    this.buffer = this.buffer.slice(lengthEndIdx + 2);

    const result = [];

    for (let i = 0; i < length; i++) {
      result.push(this.parseNext());
    }

    return result;
  }
}

export { RESPParser, RESPType };
