import { createContext, useContext, useState, useEffect } from 'react'

const FieldContext = createContext()

export function FieldProvider({ children }) {
  const [orderTypes, setOrderTypes] = useState([])
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    // Load from localStorage
    const loadFields = () => {
      try {
        const savedOrderTypes = localStorage.getItem('orderTypes')
        const savedCompanies = localStorage.getItem('companies')
        
        if (savedOrderTypes) {
          const parsed = JSON.parse(savedOrderTypes)
          setOrderTypes(Array.isArray(parsed) ? parsed : [])
        } else {
          // Default values
          const defaults = ['標準訂單', '急件訂單', '批量訂單', '客製化訂單']
          setOrderTypes(defaults)
          localStorage.setItem('orderTypes', JSON.stringify(defaults))
        }
        
        if (savedCompanies) {
          const parsed = JSON.parse(savedCompanies)
          setCompanies(Array.isArray(parsed) ? parsed : [])
        } else {
          // Default values
          const defaults = ['中信方案有限公司', '合作夥伴A', '合作夥伴B']
          setCompanies(defaults)
          localStorage.setItem('companies', JSON.stringify(defaults))
        }
      } catch (e) {
        console.error('Error loading fields from localStorage:', e)
        // Set defaults on error
        const orderDefaults = ['標準訂單', '急件訂單', '批量訂單', '客製化訂單']
        const companyDefaults = ['中信方案有限公司', '合作夥伴A', '合作夥伴B']
        setOrderTypes(orderDefaults)
        setCompanies(companyDefaults)
        localStorage.setItem('orderTypes', JSON.stringify(orderDefaults))
        localStorage.setItem('companies', JSON.stringify(companyDefaults))
      }
    }
    
    loadFields()
    
    // Reload on focus to catch any external changes
    const handleFocus = () => {
      loadFields()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
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

