# Packet Type

Its Optimized `multipart/form-data`. Pack object json but extends type `map`, `set`, `date` and `buffer`, so you can make json data with field type buffer and transfer it. Browser support coming soon

## Install
```bash
npm i packet-type
```

## Interface
```typescript
export declare class PacketTypeError extends Error {
}
declare class PacketType {
    static boundaryLength: number;
    static typename: string;
    static geneateBoundary(): string;
    static load(buffer: Buffer): any;
    static dump(object: any, saveMode?: boolean = true): Buffer;
}
export default PacketType;
```

## Example
```typescript
import { readFileSync } from "fs"
import PacketType from "packet-type"

const meta = new Map()
meta.set('author', 'Tirtha')
const packet = PacketType.dump({
  url: 'https://github.com/TirthaAhmadNazuha/packettype',
  the_file: readFileSync(import.meta.filename),
  created_at: new Date('Mon Nov 11 2024 00:00:00 GMT+0700 (Western Indonesia Time)'),
  tags: new Set(['packet', 'json', 'buffer']),
  meta,
})

console.log(packet) // <Buffer 2d 2d 64 ...>

const loaded = PacketType.load(packet)

console.log(loaded)
// {
//   url: 'https://github.com/TirthaAhmadNazuha/packettype',
//   the_file: <Buffer 69 6d 70 6f ... 379 more bytes>,
//   tags: Set(3) { 'packet', 'json', 'buffer' },
//   created_at: 2024-11-10T17:00:00.000Z,
//   meta: Map(1) { 'author' => 'Tirtha' }
// }
```
