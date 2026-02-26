export interface Deal {
  id: string
  companyName: string
  projectName?: string
  value: string
  status: string
  category: 'consumer-internet' | 'financial-services' | 'fintech' | 'software' | 'no-sector'
  icon?: string
  lastEdited?: Date
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  count: number
}
