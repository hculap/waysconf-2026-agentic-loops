/**
 * Read a Figma `.fig` file — File → Save local copy — without a dependency.
 *
 * A .fig is a zip. Inside it, `canvas.fig` holds the whole document: the eight bytes
 * `fig-kiwi`, a four-byte version, then length-prefixed chunks. Chunk 0 is the schema in
 * kiwi's binary schema format, raw-deflated. Chunk 1 is the document, encoded with that
 * schema and compressed with raw deflate or, in files saved since 2025, zstd. The schema
 * travels inside the file, so a decoder written against the format rather than against one
 * version of Figma keeps working when Figma adds fields.
 *
 * Kiwi is Evan Wallace's format (github.com/evanw/kiwi, MIT). This is the decoding half
 * only, checked field for field against the `kiwi-schema` package on a real TURBINE file.
 */

import { execFileSync } from 'node:child_process'
import zlib from 'node:zlib'

const NATIVE = ['bool', 'byte', 'int', 'uint', 'float', 'string', 'int64', 'uint64']
const KINDS = ['ENUM', 'STRUCT', 'MESSAGE']
const ZSTD_MAGIC = [0x28, 0xb5, 0x2f, 0xfd]

class Reader {
  constructor(bytes) {
    this.bytes = bytes
    this.at = 0
    this.floatView = new DataView(new ArrayBuffer(4))
  }
  byte() {
    if (this.at >= this.bytes.length) throw new Error('read past the end of the document')
    return this.bytes[this.at++]
  }
  uint() {
    let value = 0
    let shift = 0
    let b
    do {
      b = this.byte()
      value |= (b & 127) << shift
      shift += 7
    } while (b & 128 && shift < 35)
    return value >>> 0
  }
  int() {
    const v = this.uint() | 0
    return v & 1 ? ~(v >>> 1) : v >>> 1
  }
  uint64() {
    let value = 0n
    let shift = 0n
    let b
    while ((b = this.byte()) & 128 && shift < 56n) {
      value |= BigInt(b & 127) << shift
      shift += 7n
    }
    return value | (BigInt(b) << shift)
  }
  int64() {
    const v = this.uint64()
    return v & 1n ? ~(v >> 1n) : v >> 1n
  }
  float() {
    if (this.bytes[this.at] === 0) {
      this.at++
      return 0
    }
    const b = this.bytes
    let bits = b[this.at] | (b[this.at + 1] << 8) | (b[this.at + 2] << 16) | (b[this.at + 3] << 24)
    this.at += 4
    bits = (bits << 23) | (bits >>> 9)
    this.floatView.setInt32(0, bits)
    return this.floatView.getFloat32(0)
  }
  string() {
    const start = this.at
    while (this.byte() !== 0);
    return Buffer.from(this.bytes.subarray(start, this.at - 1)).toString('utf8')
  }
  byteArray() {
    const length = this.uint()
    const out = new Uint8Array(this.bytes.subarray(this.at, this.at + length))
    this.at += length
    return out
  }
}

function readSchema(bytes) {
  const r = new Reader(bytes)
  const definitions = []
  const count = r.uint()
  for (let i = 0; i < count; i++) {
    const name = r.string()
    const kind = KINDS[r.byte()]
    const fields = []
    const fieldCount = r.uint()
    for (let j = 0; j < fieldCount; j++) {
      const fieldName = r.string()
      const type = r.int()
      const isArray = Boolean(r.byte() & 1)
      fields.push({ name: fieldName, type, isArray, value: r.uint() })
    }
    definitions.push({ name, kind, fields })
  }
  for (const d of definitions) {
    for (const f of d.fields) f.type = d.kind === 'ENUM' ? null : f.type < 0 ? NATIVE[~f.type] : definitions[f.type].name
  }
  return new Map(definitions.map((d) => [d.name, d]))
}

function decode(schema, typeName, r) {
  switch (typeName) {
    case 'bool': return Boolean(r.byte())
    case 'byte': return r.byte()
    case 'int': return r.int()
    case 'uint': return r.uint()
    case 'float': return r.float()
    case 'string': return r.string()
    case 'int64': return r.int64()
    case 'uint64': return r.uint64()
  }
  const def = schema.get(typeName)
  if (def.kind === 'ENUM') {
    const value = r.uint()
    return def.fields.find((f) => f.value === value)?.name ?? value
  }
  const readField = (f) => {
    if (!f.isArray) return decode(schema, f.type, r)
    if (f.type === 'byte') return r.byteArray()
    return Array.from({ length: r.uint() }, () => decode(schema, f.type, r))
  }
  const out = {}
  if (def.kind === 'STRUCT') {
    for (const f of def.fields) out[f.name] = readField(f)
    return out
  }
  const byValue = new Map(def.fields.map((f) => [f.value, f]))
  for (let id = r.uint(); id !== 0; id = r.uint()) {
    const f = byValue.get(id)
    if (!f) throw new Error(`field ${id} is not in ${typeName} — the schema and the document disagree`)
    out[f.name] = readField(f)
  }
  return out
}

function inflate(chunk) {
  const zstd = ZSTD_MAGIC.every((b, i) => chunk[i] === b)
  if (!zstd) return zlib.inflateRawSync(chunk)
  if (typeof zlib.zstdDecompressSync !== 'function') {
    throw new Error(
      `this file is compressed with zstd, which Node ${process.version} cannot read. ` +
        'Node 22.15 or newer reads it with nothing installed; on an older Node an agent has to install a zstd package, which needs the network.',
    )
  }
  return zlib.zstdDecompressSync(chunk)
}

/** `unzip`, quietly: its own complaint is three paragraphs about multi-part archives. */
function unzip(args) {
  try {
    return execFileSync('unzip', args, { maxBuffer: 512 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
  } catch {
    throw new Error('it does not open as a zip. A .fig saved from Figma is a zip, so this one is cut short or is not a Figma file.')
  }
}

/** Every entry name in the zip. */
export function listFig(path) {
  return unzip(['-Z1', path]).toString('utf8').split('\n').map((n) => n.trim()).filter((n) => n && !n.endsWith('/'))
}

/** @returns {{ version: number, meta: object|null, entries: string[], nodes: object[] }} */
export function readFig(path) {
  const entries = listFig(path)
  if (!entries.includes('canvas.fig')) throw new Error('there is no canvas.fig inside — this is not a Figma file')
  const canvas = unzip(['-p', path, 'canvas.fig'])
  const magic = canvas.subarray(0, 8).toString('latin1')
  if (magic !== 'fig-kiwi') throw new Error(`canvas.fig starts with "${magic}", not "fig-kiwi"`)
  const chunks = []
  for (let at = 12; at < canvas.length; ) {
    const length = canvas.readUInt32LE(at)
    chunks.push(canvas.subarray(at + 4, at + 4 + length))
    at += 4 + length
  }
  const schema = readSchema(inflate(chunks[0]))
  const root = schema.get('Message') ? 'Message' : [...schema.values()].find((d) => d.kind === 'MESSAGE').name
  const message = decode(schema, root, new Reader(inflate(chunks[1])))
  let meta = null
  if (entries.includes('meta.json')) {
    meta = JSON.parse(unzip(['-p', path, 'meta.json']).toString('utf8'))
  }
  return { version: canvas.readUInt32LE(8), meta, entries, nodes: message.nodeChanges ?? [] }
}
