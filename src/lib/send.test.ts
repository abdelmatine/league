import { afterEach, describe, expect, it, vi } from 'vitest'
import { configFrom, forgetAttempt, lastSent, sendMessage, SENT_KEY } from './send'
import { COOLDOWN_MS } from './validate'

const send = vi.hoisted(() => vi.fn<(...args: unknown[]) => Promise<{ status: number; text: string }>>(async () => ({ status: 200, text: 'OK' })))
vi.mock('@emailjs/browser', () => ({ send }))

const keys = { VITE_EMAILJS_SERVICE_ID: 'service_x', VITE_EMAILJS_TEMPLATE_ID: 'template_x', VITE_EMAILJS_PUBLIC_KEY: 'public_x' }

describe('configFrom', () => {
  it('needs all three keys', () => {
    expect(configFrom({})).toBeNull()
    expect(configFrom({ ...keys, VITE_EMAILJS_PUBLIC_KEY: undefined })).toBeNull()
    expect(configFrom({ ...keys, VITE_EMAILJS_SERVICE_ID: '  ' })).toBeNull()
    expect(configFrom({ ...keys, VITE_EMAILJS_TEMPLATE_ID: ' template_x ' })).toEqual({ serviceId: 'service_x', templateId: 'template_x', publicKey: 'public_x' })
  })
})

describe('sendMessage', () => {
  it('sends the trimmed fields with the headless block and the rate limit', async () => {
    await sendMessage(configFrom(keys)!, { name: ' Lena ', email: 'lena@moreau.studio ', message: ' Hello there, Abdelmatine ' })
    expect(send).toHaveBeenCalledWith(
      'service_x',
      'template_x',
      { from_name: 'Lena', from_email: 'lena@moreau.studio', message: 'Hello there, Abdelmatine' },
      { publicKey: 'public_x', blockHeadless: true, limitRate: { id: SENT_KEY, throttle: COOLDOWN_MS } },
    )
  })

  it('passes a failure on', async () => {
    send.mockRejectedValueOnce({ status: 500, text: 'nope' })
    await expect(sendMessage(configFrom(keys)!, { name: 'Lena', email: 'a@b.cd', message: 'Hello there' })).rejects.toEqual({ status: 500, text: 'nope' })
  })
})

describe('last send record', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('reads and forgets the time EmailJS stored', () => {
    const store = new Map([[SENT_KEY, '12345']])
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, removeItem: (k: string) => store.delete(k) })
    expect(lastSent()).toBe(12345)
    forgetAttempt()
    expect(lastSent()).toBe(0)
  })

  it('treats blocked storage as nothing sent', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })
    expect(lastSent()).toBe(0)
    expect(() => forgetAttempt()).not.toThrow()
  })
})
