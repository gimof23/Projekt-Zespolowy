const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const robotoRegularFontPath = path.join(__dirname, '../public/fonts/Roboto-Regular.ttf');
const robotoBoldFontPath = path.join(__dirname, '../public/fonts/Roboto-Bold.ttf');
const cinemaLogoPath = path.join(__dirname, '../public/images/logo.png');

async function generateTicketPDF(ticketData) {
    return new Promise(function (resolve, reject) {
        (async function buildPdf() {
            try {
                if (!fs.existsSync(robotoRegularFontPath) || !fs.existsSync(robotoBoldFontPath)) {
                    return reject(new Error('Brak czcionek Roboto w public/fonts/ !'));
                }

                const pdfDoc = new PDFDocument({ size: 'A4', margin: 50 });
                const pdfChunks = [];

                pdfDoc.on('data', function (chunk) {
                    pdfChunks.push(chunk);
                });

                pdfDoc.on('end', function () {
                    const pdfBuffer = Buffer.concat(pdfChunks);
                    resolve(pdfBuffer);
                });

                pdfDoc.registerFont('Roboto', robotoRegularFontPath);
                pdfDoc.registerFont('Roboto-Bold', robotoBoldFontPath);
                pdfDoc.font('Roboto');

                if (fs.existsSync(cinemaLogoPath)) {
                    pdfDoc.image(cinemaLogoPath, 50, 45, { width: 50 });
                    pdfDoc.font('Roboto-Bold').fontSize(26).text('CINEMAŚTY', 120, 55);
                } else {
                    pdfDoc.font('Roboto-Bold').fontSize(26).text('CINEMAŚTY', 50, 55);
                }

                pdfDoc.font('Roboto').fontSize(10).fillColor('#666').text('Potwierdzenie zakupu', { align: 'right' });
                pdfDoc.moveTo(50, 110).lineTo(545, 110).lineWidth(2).strokeColor('#333').stroke();

                pdfDoc.moveDown(2);
                pdfDoc.fillColor('black').font('Roboto-Bold').fontSize(22).text(ticketData.movieTitle.toUpperCase(), { align: 'center' });

                pdfDoc.moveDown(0.5);
                pdfDoc.font('Roboto').fontSize(12).fillColor('#444');
                pdfDoc.text('Data: ' + ticketData.date + '   |   Godzina: ' + ticketData.time, { align: 'center' });
                pdfDoc.text('Sala: ' + ticketData.hall, { align: 'center' });

                pdfDoc.moveDown(2);

                const tableLeftX = 50;
                const priceColumnX = 450;
                let rowCursorY = pdfDoc.y;

                pdfDoc.rect(tableLeftX, rowCursorY - 5, 495, 25).fill('#eee');
                pdfDoc.fillColor('#000').font('Roboto-Bold').fontSize(12);
                pdfDoc.text('MIEJSCE / RODZAJ', tableLeftX + 10, rowCursorY + 2);
                pdfDoc.text('CENA', priceColumnX, rowCursorY + 2, { align: 'right', width: 80 });
                rowCursorY += 35;

                pdfDoc.font('Roboto').fontSize(12).fillColor('#333');

                if (ticketData.seats && ticketData.seats.length > 0) {
                    for (let si = 0; si < ticketData.seats.length; si++) {
                        const seatLine = ticketData.seats[si];
                        pdfDoc.text(seatLine.label, tableLeftX + 10, rowCursorY);
                        pdfDoc.text(seatLine.price + ' zł', priceColumnX, rowCursorY, { align: 'right', width: 80 });
                        pdfDoc.moveTo(tableLeftX, rowCursorY + 18).lineTo(545, rowCursorY + 18).lineWidth(0.5).strokeColor('#ddd').stroke();
                        rowCursorY += 25;
                    }
                }

                rowCursorY += 10;

                pdfDoc.rect(300, rowCursorY - 5, 245, 35).fill('#ddd');
                pdfDoc.fillColor('black').font('Roboto-Bold').fontSize(16);
                pdfDoc.text('ŁĄCZNIE:', 320, rowCursorY + 5);
                pdfDoc.text(ticketData.totalPrice + ' zł', priceColumnX, rowCursorY + 5, { align: 'right', width: 80 });

                const qrImageSize = 180;
                const qrPosX = (pdfDoc.page.width - qrImageSize) / 2;
                const qrPosY = 560;

                pdfDoc.fontSize(14).fillColor('black').font('Roboto-Bold');
                pdfDoc.text('NR REZERWACJI: ' + ticketData.reservationId, 0, qrPosY - 25, { align: 'center' });

                const seatLabelsForQr = [];
                if (ticketData.seats && ticketData.seats.length > 0) {
                    for (let qi = 0; qi < ticketData.seats.length; qi++) {
                        seatLabelsForQr.push(ticketData.seats[qi].label);
                    }
                }
                const seatsJoinedForQr = seatLabelsForQr.join(', ');

                const qrPayloadText =
                    'REZ-' +
                    ticketData.reservationId +
                    ' | ' +
                    ticketData.movieTitle +
                    ' | ' +
                    ticketData.date +
                    ' ' +
                    ticketData.time +
                    ' | ' +
                    seatsJoinedForQr +
                    ' | ' +
                    ticketData.totalPrice +
                    ' zł';

                const qrDataUrl = await QRCode.toDataURL(qrPayloadText, { margin: 1, width: qrImageSize });

                pdfDoc.image(qrDataUrl, qrPosX, qrPosY, { width: qrImageSize });

                pdfDoc.font('Roboto').fontSize(10).fillColor('#777');
                pdfDoc.text('Pokaż ten bilet obsłudze przy wejściu.', 0, qrPosY + qrImageSize + 10, { align: 'center' });

                pdfDoc.end();
            } catch (buildErr) {
                reject(buildErr);
            }
        })();
    });
}

module.exports = { generateTicketPDF };
