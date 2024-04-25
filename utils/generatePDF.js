import {jsPDF} from "jspdf";

function generatePDF() {
    const doc = new jsPDF();
    doc.text("Sub-Security Control Report", 14, 10);
    doc.text(`Control ID: `, 14, 20);
    doc.text(`Description:`, 14, 25);
    // Add more lines for functionalities, rating, etc.
    return doc.output();
}

export default generatePDF;