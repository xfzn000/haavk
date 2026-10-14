import { get, USE_MOCK } from '@/api/request'
import { employees } from '@/mock/employees'
import type { Employee } from '@/types'

export async function listEmployees(): Promise<Employee[]> {
  if (USE_MOCK) return employees
  return get<Employee[]>('/employees')
}

export async function getEmployee(id: number): Promise<Employee | undefined> {
  if (USE_MOCK) return employees.find((e) => e.id === id)
  return get<Employee>(`/employees/${id}`)
}
