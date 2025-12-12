import { createContext, useContext, useState, useEffect } from 'react'

const FieldContext = createContext()

export function FieldProvider({ children }) {
  const [orderTypes, setOrderTypes] = useState([])
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    // Load from localStorage
    const savedOrderTypes = localStorage.getItem('orderTypes')
    const savedCompanies = localStorage.getItem('companies')
    
    if (savedOrderTypes) {
      setOrderTypes(JSON.parse(savedOrderTypes))
    } else {
      // Default values
      const defaults = ['標準訂單', '急件訂單', '批量訂單', '客製化訂單']
      setOrderTypes(defaults)
      localStorage.setItem('orderTypes', JSON.stringify(defaults))
    }
    
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies))
    } else {
      // Default values
      const defaults = ['中信方案有限公司', '合作夥伴A', '合作夥伴B']
      setCompanies(defaults)
      localStorage.setItem('companies', JSON.stringify(defaults))
    }
  }, [])

  const addOrderType = (value) => {
    const updated = [...orderTypes, value]
    setOrderTypes(updated)
    localStorage.setItem('orderTypes', JSON.stringify(updated))
  }

  const deleteOrderType = (index) => {
    const updated = orderTypes.filter((_, i) => i !== index)
    setOrderTypes(updated)
    localStorage.setItem('orderTypes', JSON.stringify(updated))
  }

  const updateOrderType = (index, value) => {
    const updated = [...orderTypes]
    updated[index] = value
    setOrderTypes(updated)
    localStorage.setItem('orderTypes', JSON.stringify(updated))
  }

  const addCompany = (value) => {
    const updated = [...companies, value]
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
  }

  const deleteCompany = (index) => {
    const updated = companies.filter((_, i) => i !== index)
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
  }

  const updateCompany = (index, value) => {
    const updated = [...companies]
    updated[index] = value
    setCompanies(updated)
    localStorage.setItem('companies', JSON.stringify(updated))
  }

  const value = {
    orderTypes,
    companies,
    addOrderType,
    deleteOrderType,
    updateOrderType,
    addCompany,
    deleteCompany,
    updateCompany
  }

  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
}

export function useFields() {
  const context = useContext(FieldContext)
  if (!context) {
    throw new Error('useFields must be used within FieldProvider')
  }
  return context
}

