import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

export const downloadPDF = async (formData, orderId) => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Add logo placeholder
  pdf.setFontSize(16)
  pdf.text('中信方案有限公司', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  // Title
  pdf.setFontSize(20)
  pdf.setFont(undefined, 'bold')
  pdf.text('訂單表單', pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  // Order ID
  pdf.setFontSize(12)
  pdf.setFont(undefined, 'normal')
  pdf.text(`訂單編號: ${orderId}`, margin, yPos)
  yPos += 10

  // Form data
  pdf.setFontSize(14)
  pdf.setFont(undefined, 'bold')
  pdf.text('訂單詳情', margin, yPos)
  yPos += 10

  pdf.setFontSize(12)
  pdf.setFont(undefined, 'normal')
  
  const fields = [
    ['訂單類型', formData.orderType],
    ['所屬公司', formData.company],
    ['客戶姓名', formData.customerName],
    ['聯絡電話', formData.phone],
    ['電子郵件', formData.email],
    ['送貨地址', formData.address],
    ['備註', formData.notes || '無']
  ]

  fields.forEach(([label, value]) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage()
      yPos = margin
    }
    pdf.setFont(undefined, 'bold')
    pdf.text(`${label}:`, margin, yPos)
    pdf.setFont(undefined, 'normal')
    const textLines = pdf.splitTextToSize(value || '無', pageWidth - 2 * margin - 50)
    pdf.text(textLines, margin + 40, yPos)
    yPos += textLines.length * 7 + 5
  })

  // Terms and conditions
  if (yPos > pageHeight - 100) {
    pdf.addPage()
    yPos = margin
  }

  yPos += 10
  pdf.setFontSize(14)
  pdf.setFont(undefined, 'bold')
  pdf.text('條款細則', margin, yPos)
  yPos += 10

  pdf.setFontSize(10)
  pdf.setFont(undefined, 'normal')
  const terms = getTermsAndConditions()
  const termsLines = pdf.splitTextToSize(terms, pageWidth - 2 * margin)
  termsLines.forEach(line => {
    if (yPos > pageHeight - 20) {
      pdf.addPage()
      yPos = margin
    }
    pdf.text(line, margin, yPos)
    yPos += 5
  })

  // Footer
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.text(
      `第 ${i} 頁 / 共 ${totalPages} 頁`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  pdf.save(`訂單表單_${orderId}.pdf`)
}

export const downloadWord = async (formData, orderId) => {
  const terms = getTermsAndConditions()
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: '中信方案有限公司',
          alignment: AlignmentType.CENTER,
          heading: 'Heading1',
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: '訂單表單',
          alignment: AlignmentType.CENTER,
          heading: 'Heading1',
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: `訂單編號: ${orderId}`,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: '訂單詳情',
          heading: 'Heading2',
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '訂單類型: ', bold: true }),
            new TextRun({ text: formData.orderType || '無' })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '所屬公司: ', bold: true }),
            new TextRun({ text: formData.company || '無' })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '客戶姓名: ', bold: true }),
            new TextRun({ text: formData.customerName || '無' })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '聯絡電話: ', bold: true }),
            new TextRun({ text: formData.phone || '無' })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '電子郵件: ', bold: true }),
            new TextRun({ text: formData.email || '無' })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '送貨地址: ', bold: true }),
            new TextRun({ text: formData.address || '無' })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '備註: ', bold: true }),
            new TextRun({ text: formData.notes || '無' })
          ],
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: '條款細則',
          heading: 'Heading2',
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: terms,
          spacing: { after: 200 }
        })
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `訂單表單_${orderId}.docx`)
}

export const downloadJPG = async (formData, orderId) => {
  const formElement = document.getElementById('order-form-print')
  if (!formElement) {
    alert('無法找到表單元素')
    return
  }

  const canvas = await html2canvas(formElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })

  canvas.toBlob((blob) => {
    saveAs(blob, `訂單表單_${orderId}.jpg`)
  }, 'image/jpeg', 0.95)
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

