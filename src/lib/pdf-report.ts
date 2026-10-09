import {jsPDF} from 'jspdf';
export function reportPdf(title:string,sections:{heading:string;lines:string[]}[]){
 const pdf=new jsPDF();let y=24;
 const text=(value:string,size=11)=>{pdf.setFontSize(size);const lines=pdf.splitTextToSize(value.replace(/[—–]/g,'-').replace(/→/g,'to').replace(/·/g,' / '),174) as string[];for(const line of lines){if(y>275){pdf.addPage();y=24}pdf.text(line,18,y);y+=size*.48}y+=3};
 pdf.setTextColor(18,48,66);text('LUNARIS',12);text(title,22);text('Generated '+new Date().toISOString().slice(0,16).replace('T',' ')+' UTC',9);y+=5;
 for(const section of sections){if(y>250){pdf.addPage();y=24}pdf.setFont('helvetica','bold');text(section.heading,13);pdf.setFont('helvetica','normal');for(const line of section.lines)text(line);y+=5}
 const count=pdf.getNumberOfPages();for(let i=1;i<=count;i++){pdf.setPage(i);pdf.setFontSize(8);pdf.setTextColor(100);pdf.text('LUNARIS / Educational research preview',18,288);pdf.text(`${i} / ${count}`,180,288)}return pdf;
}
export async function downloadReport(title:string,filename:string,sections:{heading:string;lines:string[]}[]){reportPdf(title,sections).save(filename+'.pdf')}
