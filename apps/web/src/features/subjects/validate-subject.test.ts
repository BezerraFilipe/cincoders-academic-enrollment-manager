import { describe, expect, it } from 'vitest'
import { validateSubject } from './validate-subject'

const valid = { code: 'IF668', name: 'Introdução à Computação', workloadHours: '60' }

describe('validateSubject', () => {
  it('accepts valid values', () => {
    expect(validateSubject(valid)).toEqual({})
  })

  it.each(['15', '120'])('accepts %sh as workload', (workloadHours) => {
    expect(validateSubject({ ...valid, workloadHours })).toEqual({})
  })

  it.each(['0', '20', '135', ''])('rejects "%s" as workload', (workloadHours) => {
    expect(validateSubject({ ...valid, workloadHours }).workloadHours).toBeDefined()
  })

  it('rejects a code with spaces', () => {
    expect(validateSubject({ ...valid, code: 'IF 668' }).code).toBeDefined()
  })

  it('rejects a name that is too short', () => {
    expect(validateSubject({ ...valid, name: 'AB' }).name).toBeDefined()
  })
})
