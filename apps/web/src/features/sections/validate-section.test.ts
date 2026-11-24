import { describe, expect, it } from 'vitest'
import { validateSection } from './validate-section'

const valid = { subjectId: '1', professorId: '2', code: 'A', capacity: '30' }

describe('validateSection', () => {
  it('accepts valid values', () => {
    expect(validateSection(valid)).toEqual({})
  })

  it('requires subject and professor', () => {
    const errors = validateSection({ ...valid, subjectId: '', professorId: '' })

    expect(errors.subjectId).toBeDefined()
    expect(errors.professorId).toBeDefined()
  })

  it.each(['0', '-1', '1.5', ''])('rejects "%s" as capacity', (capacity) => {
    expect(validateSection({ ...valid, capacity }).capacity).toBeDefined()
  })

  it('rejects a capacity below the number of enrolled students', () => {
    expect(validateSection({ ...valid, capacity: '4' }, 5).capacity).toContain('5 alunos')
  })

  it('accepts a capacity equal to the number of enrolled students', () => {
    expect(validateSection({ ...valid, capacity: '5' }, 5)).toEqual({})
  })
})
