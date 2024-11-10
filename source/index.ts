export class PacketTypeError extends Error { }

class PacketType {
  static boundaryLength = 17

  static typename = 'alisa-content/packet'

  static geneateBoundary() {
    const array = new Uint8Array(PacketType.boundaryLength)
    crypto.getRandomValues(array)
    return Array.from(array, byte =>
      byte.toString(19).padStart(2, '0')
    ).join('').slice(0, PacketType.boundaryLength) + '>'
  }

  static load(buffer: Buffer): any {
    if (!(buffer instanceof Buffer)) throw new PacketTypeError('input must typed Buffer')
    let boundary: Buffer | string | undefined
    if (!(boundary = /^---([a-zA-Z0-9]{17}>)/.exec(buffer.subarray(0, 21).toString())?.[1])) throw new PacketTypeError('input buffer not packet content type.')
    boundary = Buffer.from(boundary)
    const files: Buffer[] = []
    buffer = buffer.subarray(21)
    let index = buffer.indexOf(boundary)
    while (index > 0) {
      const file = buffer.subarray(0, index)
      buffer = buffer.subarray(index + boundary.length)
      index = buffer.indexOf(boundary)
      files.push(file)
    }
    files.push(buffer)

    if (!files[0]) throw new PacketTypeError('not found head')
    let head = files.shift()?.toString() || ''
    const result = JSON.parse(
      head,
      (key, value) => {
        if (value instanceof Object) {
          switch (value['@type']) {
            case 'buffer':
              return files[value.v]
            case 'set':
              return new Set(value.v)
            case 'date':
              return new Date(value.v)
            case 'map':
              return new Map(Object.entries(value.v))
          }
        }
        return value
      }
    )

    return result
  }

  static dump(object: any, saveMode = true): Buffer {
    const files: Buffer[] = []

    function findAndConvertBuffers(data: any) {
      if (Buffer.isBuffer(data)) {
        const v = files.length
        files.push(data)
        return {
          '@type': 'buffer',
          v
        }
      }
      if (data instanceof Set) {
        return {
          '@type': 'set',
          v: Array.from(data)
        }
      }
      if (data instanceof Map) {
        const v = {}
        data.forEach((val, key) => v[key] = val)
        return {
          '@type': 'map',
          v
        }
      }
      if (data instanceof Date) {
        return {
          '@type': 'date',
          v: data.toISOString()
        }
      }
      if (Array.isArray(data)) {
        return data.map(item => findAndConvertBuffers(item))
      }
      if (typeof data === 'object' && data !== null) {
        return Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, findAndConvertBuffers(value)])
        )
      }
      return data
    }

    files.unshift(Buffer.from(JSON.stringify(findAndConvertBuffers(object))))
    let boundary = Buffer.from(PacketType.geneateBoundary())
    if (saveMode) {
      while (files.find(buff => buff.indexOf(boundary) > -1)) {
        boundary = Buffer.from(PacketType.geneateBoundary())
      }
    }

    return Buffer.concat([Buffer.from('---'),
    ...files.map((buff) => Buffer.concat([boundary, buff]))
    ])
  }
}

export default PacketType
