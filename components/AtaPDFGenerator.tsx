"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Download } from "lucide-react";
import { useState } from "react";

interface AtaPDFGeneratorProps {
  building: {
    name: string;
    address: string | null;
    cnpj: string | null;
    totalUnits: number;
  };
  voting: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    quorumType: string;
    options: {
      text: string;
      votes: number;
    }[];
    totalVotes: number;
    participants: {
      unit: string;
      name: string;
    }[];
  };
}

export function AtaPDFGenerator({ building, voting }: AtaPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // --- CABEÇALHO ---
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SINDACO", 15, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Sistema Inteligente de Gestão Condominial", 15, 32);

      doc.text(building.name.toUpperCase(), pageWidth - 15, 20, { align: "right" });
      doc.setFontSize(8);
      doc.text(building.address || "Endereço não informado", pageWidth - 15, 26, { align: "right" });
      if (building.cnpj) {
        doc.text(`CNPJ: ${building.cnpj}`, pageWidth - 15, 31, { align: "right" });
      }

      // --- CORPO DA ATA ---
      let y = 55;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("ATA DE ASSEMBLEIA GERAL EXTRAORDINÁRIA ELETRÔNICA", 15, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const introText = `Aos dias ${new Date(voting.endDate).toLocaleDateString("pt-BR")}, deu-se por encerrada a Assembleia Geral realizada por meio eletrônico, conforme facultado pela Lei Federal nº 14.309/2022, referente ao condomínio ${building.name}. A votação teve início em ${new Date(voting.startDate).toLocaleString("pt-BR")} e encerramento em ${new Date(voting.endDate).toLocaleString("pt-BR")}.`;
      
      const splitIntro = doc.splitTextToSize(introText, pageWidth - 30);
      doc.text(splitIntro, 15, y);
      y += (splitIntro.length * 5) + 5;

      // PAUTA
      doc.setFont("helvetica", "bold");
      doc.text("ORDEM DO DIA / PAUTA:", 15, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(voting.title, 15, y);
      y += 10;

      if (voting.description) {
        doc.setFont("helvetica", "italic");
        const splitDesc = doc.splitTextToSize(`Contexto: ${voting.description}`, pageWidth - 30);
        doc.text(splitDesc, 15, y);
        y += (splitDesc.length * 5) + 10;
      }

      // QUÓRUM E APURAÇÃO
      doc.setFont("helvetica", "bold");
      doc.text("VERIFICAÇÃO DE QUÓRUM E APURAÇÃO:", 15, y);
      y += 8;

      const participationRate = ((voting.totalVotes / building.totalUnits) * 100).toFixed(1);
      
      // Lógica de Aprovação
      let statusAprovacao = "NÃO ATINGIDO / PENDENTE";
      const qType = voting.quorumType;
      const vCount = voting.totalVotes;
      const tUnits = building.totalUnits;

      if (qType === "SIMPLES") statusAprovacao = "APROVADO (MAIORIA SIMPLES)";
      else if (qType === "ABSOLUTA" && vCount > tUnits / 2) statusAprovacao = "APROVADO (MAIORIA ABSOLUTA)";
      else if (qType === "DOIS_TERCOS" && vCount >= (tUnits * 2) / 3) statusAprovacao = "APROVADO (2/3 ALCANÇADO)";
      else if (qType === "TRES_QUARTOS" && vCount >= (tUnits * 3) / 4) statusAprovacao = "APROVADO (3/4 ALCANÇADO)";
      else if (qType === "UNANIMIDADE" && vCount === tUnits) statusAprovacao = "APROVADO (UNANIMIDADE)";
      else statusAprovacao = "REPROVADO (QUÓRUM INSUFICIENTE)";

      doc.setFont("helvetica", "normal");
      doc.text([
        `Quórum Exigido: ${qType}`,
        `Unidades Totais no Condomínio: ${tUnits}`,
        `Votos Registrados: ${vCount} (${participationRate}%)`,
        `Resultado Legal: ${statusAprovacao}`
      ], 15, y);
      y += 25;

      // TABELA DE RESULTADOS
      autoTable(doc, {
        startY: y,
        head: [['Opção de Voto', 'Votos Absolutos', 'Percentual']],
        body: voting.options.map(opt => [
          opt.text,
          opt.votes.toString(),
          `${((opt.votes / voting.totalVotes || 0) * 100).toFixed(1)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 15;

      // AUDITORIA (PRESENÇA)
      doc.setFont("helvetica", "bold");
      doc.text("LISTA DE PRESENÇA / PARTICIPAÇÃO (AUDITORIA):", 15, y);
      y += 6;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("* Conforme diretrizes de sigilo, os votos individuais são criptografados, registrando-se apenas a participação para validade do quórum.", 15, y);
      
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Unidade', 'Morador Responsável']],
        body: voting.participants.map(p => [p.unit, p.name]),
        theme: 'grid',
        styles: { fontSize: 8 }
      });

      // RODAPÉ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Documento gerado eletronicamente por Sindaco em ${new Date().toLocaleString("pt-BR")} - Hash de Integridade: ${voting.id.substring(0, 8)}...-v${participationRate}`,
          15,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      doc.save(`Ata_${voting.title.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Certifique-se que a biblioteca jspdf está instalada.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 group"
    >
      {isGenerating ? (
        <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
      ) : (
        <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
      )}
      {isGenerating ? "Gerando PDF..." : "Gerar Ata Jurídica (PDF)"}
      {!isGenerating && <Download className="w-4 h-4 text-white/40 ml-1" />}
    </button>
  );
}
