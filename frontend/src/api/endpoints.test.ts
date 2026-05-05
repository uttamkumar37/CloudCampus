import { describe, expect, it } from 'vitest'

import { ENDPOINTS } from './endpoints'

describe('ENDPOINTS', () => {
  it('builds tenant school endpoint by slug', () => {
    expect(ENDPOINTS.tenants.schoolBySlug('demo-school')).toBe('/tenants/schools/demo-school')
  })

  it('builds parent link deletion endpoint by link id', () => {
    expect(ENDPOINTS.parent.linkById('abc-123')).toBe('/parents/links/abc-123')
  })

  it('builds timetable endpoint by class and section', () => {
    expect(ENDPOINTS.timetable.byClassSection('class-1', 'section-a')).toBe(
      '/timetable/classes/class-1/sections/section-a',
    )
  })
})
