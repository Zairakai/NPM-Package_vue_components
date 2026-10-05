import { describe, expect, it } from 'vitest'
import {
  formatBytes,
  joinHex,
  matchesAccept,
  normalizeHex,
  otpDigits,
  snap,
  splitHex,
  splitTags,
  validateFiles,
} from '../../src/Form/inputs'

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type })

describe('form input helpers', () => {
  it('should snap a value to a step inside the bounds', () => {
    expect(snap(7, 0, 100, 5)).toBe(5)
    expect(snap(8, 0, 100, 5)).toBe(10)
    expect(snap(150, 0, 100, 5)).toBe(100)
    expect(snap(-4, 0, 100, 5)).toBe(0)
    expect(snap(0.74, 0, 5, 0.5)).toBe(0.5)
    expect(snap(0.3, 0, 1, 0.1)).toBe(0.3)
  })

  it('should split tags on separators and drop the empty ones', () => {
    expect(splitTags('a, b;;c ,')).toEqual(['a', 'b', 'c'])
    expect(splitTags('a b|c', ['|'])).toEqual(['a b', 'c'])
    expect(splitTags('a\nb')).toEqual(['a', 'b'])
    expect(splitTags('a]b^c-d\\e', [']', '^', '-', '\\'])).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(splitTags('  ')).toEqual([])
  })

  it('should keep the digits of a code and cut it', () => {
    expect(otpDigits('12 34-56789', 6)).toEqual(['1', '2', '3', '4', '5', '6'])
    expect(otpDigits('a1b2', 6, /[a-z]/)).toEqual(['a', 'b'])
    expect(otpDigits('', 4)).toEqual([])
  })

  it('should normalize hex colours', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('abc')).toBe('#aabbcc')
    expect(normalizeHex('#abcd')).toBe('#aabbccdd')
    expect(normalizeHex('#a1b2c3')).toBe('#a1b2c3')
    expect(normalizeHex('#a1b2c380')).toBe('#a1b2c380')
    expect(normalizeHex('#12')).toBeUndefined()
    expect(normalizeHex('nope')).toBeUndefined()
  })

  it('should split and join a colour and its opacity', () => {
    expect(splitHex('#ff000080')).toEqual({ color: '#ff0000', alpha: 0.5 })
    expect(splitHex('#f00')).toEqual({ color: '#ff0000', alpha: 1 })
    expect(splitHex('x')).toBeUndefined()
    expect(joinHex('#ff0000', 0.5)).toBe('#ff000080')
    expect(joinHex('#ff0000', 1)).toBe('#ff0000')
    expect(joinHex('#ff0000', -1)).toBe('#ff000000')
    expect(joinHex('xyz', 1)).toBe('#000000')
  })

  it('should format bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB')
    expect(formatBytes(1024 ** 5)).toBe('1048576 GB')
  })

  it('should match the accept rules', () => {
    expect(matchesAccept(file('a.PNG', 'image/png'), '.png')).toBe(true)
    expect(matchesAccept(file('a.png', 'image/png'), 'image/*')).toBe(true)
    expect(matchesAccept(file('a.png', 'image/png'), 'application/pdf, image/png')).toBe(true)
    expect(matchesAccept(file('a.txt', 'text/plain'), 'image/*,.pdf')).toBe(false)
    expect(matchesAccept(file('a.txt', 'text/plain'), '')).toBe(true)
  })

  it('should sort files into accepted and rejected with the reason', () => {
    const current = [file('old.png', 'image/png')]
    const result = validateFiles(
      current,
      [
        file('a.png', 'image/png'),
        file('b.txt', 'text/plain'),
        file('big.png', 'image/png', 5000),
        file('c.png', 'image/png'),
      ],
      {
        accept: 'image/*',
        maxSize: 1000,
        maxFiles: 2,
      }
    )

    expect(result.accepted.map((item) => item.name)).toEqual(['a.png'])
    expect(result.rejected.map((item) => item.reason)).toEqual(['type', 'size', 'count'])
    expect(validateFiles([], [file('a.txt', 'text/plain')], {}).accepted).toHaveLength(1)
  })
})
