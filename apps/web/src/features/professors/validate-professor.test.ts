import { describe, expect, it } from 'vitest'
import { validateProfessor } from './validate-professor'

describe('validateProfessor', () => {
  it('accepts valid values', () => {
    expect(validateProfessor({ name: 'Paulo Borba', email: 'paulo@cin.ufpe.br' })).toEqual({})
  })

  it.each(['', 'paulo', 'paulo@', 'paulo@cin', 'paulo borba@cin.ufpe.br'])(
    'rejects "%s" as e-mail',
    (email) => {
      expect(validateProfessor({ name: 'Paulo Borba', email }).email).toBeDefined()
    },
  )

  it('rejects a name that is too short', () => {
    expect(validateProfessor({ name: 'Al', email: 'al@cin.ufpe.br' }).name).toBeDefined()
  })
})
