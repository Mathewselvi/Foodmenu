const PDFDocument = require('pdfkit');

const generateBillPDF = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Theme colors
            const brandColor = '#059669'; // Emerald Green
            const darkColor = '#1f2937'; // Gray 800
            const lightColor = '#6b7280'; // Gray 500

            // --- HEADER ---
            doc.fillColor(brandColor)
               .fontSize(26)
               .font('Helvetica-Bold')
               .text('Resort Beyond Heaven', 50, 50);

            doc.fillColor(lightColor)
               .fontSize(10)
               .font('Helvetica')
               .text('The Premium Food Experience', 50, 80)
               .text('Phone: +91 96330 35175', 50, 95)
               .text('Email: hello@beyondheaven.com', 50, 110);

            // Receipt Badge
            doc.fillColor(darkColor)
               .fontSize(22)
               .font('Helvetica-Bold')
               .text('RECEIPT', 400, 50, { align: 'right' });

            doc.fillColor(lightColor)
               .fontSize(10)
               .font('Helvetica')
               .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 400, 80, { align: 'right' })
               .text(`Order ID: #${order._id.toString().slice(-6).toUpperCase()}`, 400, 95, { align: 'right' });

            // Header Divider
            doc.moveTo(50, 140).lineTo(545, 140).lineWidth(1).strokeColor('#e5e7eb').stroke();

            // --- BILL TO ---
            doc.fillColor(darkColor)
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('Billed To:', 50, 160);

            doc.fillColor(lightColor)
               .fontSize(10)
               .font('Helvetica')
               .text(`Guest Name: ${order.guestName}`, 50, 175)
               .text(`Email: ${order.email}`, 50, 190);

            // --- TABLE HEADER ---
            const tableTop = 230;
            // Draw background rectangle for header
            doc.rect(50, tableTop, 495, 30).fillColor(brandColor).fill();

            doc.fillColor('#ffffff')
               .fontSize(10)
               .font('Helvetica-Bold');
            doc.text('ITEM DESCRIPTION', 60, tableTop + 10);
            doc.text('QTY', 350, tableTop + 10, { width: 40, align: 'center' });
            doc.text('PRICE', 400, tableTop + 10, { width: 60, align: 'right' });
            doc.text('AMOUNT', 470, tableTop + 10, { width: 65, align: 'right' });

            // --- TABLE ROWS ---
            doc.fillColor(darkColor)
               .font('Helvetica')
               .fontSize(10);
               
            let y = tableTop + 45;

            order.items.forEach(item => {
                doc.text(item.name, 60, y);
                doc.text(item.qty.toString(), 350, y, { width: 40, align: 'center' });
                doc.text(`Rs. ${item.price}`, 400, y, { width: 60, align: 'right' });
                doc.text(`Rs. ${item.price * item.qty}`, 470, y, { width: 65, align: 'right' });
                
                // Subtle line separator
                doc.moveTo(50, y + 20).lineTo(545, y + 20).lineWidth(0.5).strokeColor('#f3f4f6').stroke();
                y += 35;
            });

            // Service Fee Row (dynamic)
            if (order.serviceCharge && order.serviceCharge > 0) {
                doc.fillColor(lightColor).text('Service Fee / Delivery', 60, y);
                doc.text('-', 350, y, { width: 40, align: 'center' });
                doc.text('-', 400, y, { width: 60, align: 'right' });
                doc.text(`Rs. ${order.serviceCharge}`, 470, y, { width: 65, align: 'right' });
                
                doc.moveTo(50, y + 20).lineTo(545, y + 20).lineWidth(0.5).strokeColor('#e5e7eb').stroke();
                y += 40;
            }

            // --- TOTALS SECTION ---
            // Draw shaded box for totals
            doc.rect(330, y, 215, 45).fillColor('#f9fafb').fill();
            
            doc.fillColor(darkColor)
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('Total Paid:', 340, y + 15, { width: 80, align: 'left' });
               
            doc.fillColor(brandColor)
               .fontSize(16)
               .text(`Rs. ${order.totalAmount}`, 430, y + 14, { width: 105, align: 'right' });

            // --- FOOTER ---
            const footerY = 700;
            doc.moveTo(50, footerY).lineTo(545, footerY).lineWidth(1).strokeColor('#e5e7eb').stroke();
            
            doc.fillColor(lightColor)
               .fontSize(10)
               .font('Helvetica')
               .text('Thank you for choosing Resort Beyond Heaven!', 50, footerY + 15, { align: 'center' })
               .text('If you have any questions about this receipt, please contact us.', 50, footerY + 30, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateBillPDF;
