import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { FieldProvider, useFields } from '../contexts/FieldContext'
import { downloadPDF, downloadWord, downloadJPG } from '../utils/downloadUtils'
import '../styles/OrderForm.css'
// Logo will be handled via CSS fallback if image doesn't exist

function OrderFormContent() {
  const { user, logout } = useAuth()
  const { orderTypes, companies } = useFields()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    orderType: '',
    company: '',
    customerName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })

  const [orderId] = useState(() => {
    return `ORD-${Date.now()}`
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDownload = async (format) => {
    if (!formData.orderType || !formData.company || !formData.customerName) {
      alert('請填寫必填欄位（訂單類型、所屬公司、客戶姓名）')
      return
    }

    try {
      switch (format) {
        case 'pdf':
          await downloadPDF(formData, orderId)
          break
        case 'word':
          await downloadWord(formData, orderId)
          break
        case 'jpg':
          await downloadJPG(formData, orderId)
          break
        default:
          alert('不支援的格式')
      }
    } catch (error) {
      console.error('下載失敗:', error)
      alert('下載失敗，請稍後再試')
    }
  }

  return (
    <div className="order-form-container">
      <motion.div
        className="order-form-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-logo">
          <div className="logo-placeholder">
            <div className="logo-graphic">
              <div className="logo-z"></div>
              <div className="logo-x"></div>
            </div>
            <div className="logo-text">
              <div className="logo-chinese">中信方案</div>
              <div className="logo-english">ZX SOLUTION</div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="admin-button">
              管理後台
            </button>
          )}
          <button onClick={() => { logout(); navigate('/login') }} className="logout-button">
            登出
          </button>
        </div>
      </motion.div>

      <motion.div
        className="order-form-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="form-title">訂單表單</h1>
        <p className="form-subtitle">請填寫以下資料以完成訂單</p>

        <form className="order-form" id="order-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="orderType">訂單類型 <span className="required">*</span></label>
              <select
                id="orderType"
                name="orderType"
                value={formData.orderType}
                onChange={handleChange}
                required
              >
                <option value="">請選擇</option>
                {orderTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="company">所屬公司 <span className="required">*</span></label>
              <select
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              >
                <option value="">請選擇</option>
                {companies.map((company, index) => (
                  <option key={index} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="customerName">客戶姓名 <span className="required">*</span></label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder="請輸入客戶姓名"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">聯絡電話</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="請輸入聯絡電話"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">電子郵件</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">送貨地址</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="請輸入完整送貨地址"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">備註</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="其他需要說明的資訊"
            />
          </div>

          <div className="download-buttons">
            <motion.button
              type="button"
              onClick={() => handleDownload('pdf')}
              className="download-btn pdf-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📄 下載 PDF
            </motion.button>
            <motion.button
              type="button"
              onClick={() => handleDownload('word')}
              className="download-btn word-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📝 下載 Word
            </motion.button>
            <motion.button
              type="button"
              onClick={() => handleDownload('jpg')}
              className="download-btn jpg-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🖼️ 下載 JPG
            </motion.button>
          </div>
        </form>

        {/* Hidden form for JPG generation */}
        <div id="order-form-print" className="print-form" style={{ display: 'none' }}>
          <div className="print-header">
            <div className="print-logo">
              <div className="logo-placeholder">
                <div className="logo-graphic">
                  <div className="logo-z"></div>
                  <div className="logo-x"></div>
                </div>
                <div className="logo-text">
                  <div className="logo-chinese">中信方案</div>
                  <div className="logo-english">ZX SOLUTION</div>
                </div>
              </div>
            </div>
            <div className="print-company-info">
              <div><strong>中信方案有限公司</strong></div>
              <div>123 Maple Street Anytown, PA 17101</div>
              <div>info@example.com</div>
              <div>www.example.com</div>
              <div>(123) 1234567</div>
            </div>
          </div>
          <h1>訂單表單</h1>
          <p className="print-subtitle">訂單編號: {orderId}</p>
          <div className="print-content">
            <div className="print-section">
              <h2>訂單詳情</h2>
              <div className="print-field">
                <strong>訂單類型:</strong> {formData.orderType || '無'}
              </div>
              <div className="print-field">
                <strong>所屬公司:</strong> {formData.company || '無'}
              </div>
              <div className="print-field">
                <strong>客戶姓名:</strong> {formData.customerName || '無'}
              </div>
              <div className="print-field">
                <strong>聯絡電話:</strong> {formData.phone || '無'}
              </div>
              <div className="print-field">
                <strong>電子郵件:</strong> {formData.email || '無'}
              </div>
              <div className="print-field">
                <strong>送貨地址:</strong> {formData.address || '無'}
              </div>
              <div className="print-field">
                <strong>備註:</strong> {formData.notes || '無'}
              </div>
            </div>
            <div className="print-section">
              <h2>條款細則</h2>
              <div className="print-terms">
                {getTermsAndConditions().split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const getTermsAndConditions = () => {
  return `1. 訂單確認
   客戶提交訂單後，本公司將於3個工作天內確認訂單。訂單一經確認，客戶不得隨意取消或修改，除非獲得本公司書面同意。

2. 付款條款
   客戶須於訂單確認後7個工作天內完成付款。如未能在指定期限內付款，本公司保留取消訂單的權利。

3. 送貨安排
   標準訂單：7-14個工作天
   急件訂單：3-5個工作天
   批量訂單：14-21個工作天
   客製化訂單：視乎具體要求而定

4. 品質保證
   本公司保證所提供的產品及服務符合相關標準。如發現品質問題，客戶須於收貨後7個工作天內提出，逾期恕不受理。

5. 退換貨政策
   除非產品有明顯缺陷或與訂單不符，否則不接受退換貨。退換貨申請須於收貨後7個工作天內提出。

6. 責任限制
   本公司對因不可抗力因素（包括但不限於自然災害、戰爭、罷工等）導致的延誤或損失不承擔責任。

7. 資料保密
   本公司承諾對客戶提供的所有資料嚴格保密，僅用於處理訂單相關事宜。

8. 適用法律
   本訂單受香港特別行政區法律管轄，任何爭議應提交香港法院解決。

9. 其他條款
   本公司保留隨時修改本條款細則的權利，修改後的條款將於網站上公布。客戶繼續使用本服務即視為接受修改後的條款。

如有任何疑問，請聯絡本公司客戶服務部。`
}

function OrderForm() {
  return (
    <FieldProvider>
      <OrderFormContent />
    </FieldProvider>
  )
}

export default OrderForm

