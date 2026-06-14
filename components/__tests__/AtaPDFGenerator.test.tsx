import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AtaPDFGenerator } from "../AtaPDFGenerator";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Mocks do jsPDF
const mockSave = jest.fn();
const mockText = jest.fn();
const mockRect = jest.fn();
const mockSetFillColor = jest.fn();
const mockSetTextColor = jest.fn();
const mockSetFontSize = jest.fn();
const mockSetFont = jest.fn();
const mockSplitTextToSize = jest.fn((text: string) => [text]);
const mockSetPage = jest.fn();

jest.mock("jspdf", () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => {
      return {
        internal: {
          pageSize: {
            getWidth: () => 210,
            getHeight: () => 297,
          },
          getNumberOfPages: () => 1,
        },
        rect: mockRect,
        setFillColor: mockSetFillColor,
        setTextColor: mockSetTextColor,
        setFontSize: mockSetFontSize,
        setFont: mockSetFont,
        text: mockText,
        splitTextToSize: mockSplitTextToSize,
        save: mockSave,
        setPage: mockSetPage,
      };
    }),
  };
});

// Mock do jspdf-autotable
jest.mock("jspdf-autotable", () => {
  return jest.fn((doc, options) => {
    // Adiciona lastAutoTable no mock do jsPDF para evitar erros de compilação
    (doc as any).lastAutoTable = { finalY: 120 };
  });
});

describe("AtaPDFGenerator Component", () => {
  const defaultProps = {
    building: {
      name: "Residencial Palmeiras",
      address: "Rua das Flores, 123",
      cnpj: "12345678901234",
      totalUnits: 100,
    },
    voting: {
      id: "vot-12345",
      title: "Pintura Externa das Fachadas",
      description: "Aprovação de orçamento para pintura de todas as torres.",
      startDate: new Date("2026-05-01T08:00:00Z"),
      endDate: new Date("2026-05-10T18:00:00Z"),
      quorumType: "DOIS_TERCOS",
      options: [
        { text: "Opção A (R$ 50k)", votes: 68 },
        { text: "Opção B (R$ 55k)", votes: 12 },
        { text: "Rejeitar Obra", votes: 5 },
      ],
      totalVotes: 85,
      participants: [
        { unit: "Apto 101", name: "Murat" },
        { unit: "Apto 102", name: "Raphael" },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o botão com o texto correto", () => {
    render(<AtaPDFGenerator {...defaultProps} />);
    
    expect(screen.getByText("Gerar Ata Jurídica (PDF)")).toBeInTheDocument();
  });

  it("deve instanciar o jsPDF e chamar o método save ao clicar no botão", () => {
    render(<AtaPDFGenerator {...defaultProps} />);
    
    const button = screen.getByText("Gerar Ata Jurídica (PDF)");
    fireEvent.click(button);

    // Verifica se instanciou o jsPDF
    expect(jsPDF).toHaveBeenCalled();

    // Verifica se desenhou o banner/cabeçalho retangular
    expect(mockRect).toHaveBeenCalled();

    // Verifica se adicionou textos importantes ao PDF
    expect(mockText).toHaveBeenCalledWith("SINDACO", 15, 25);
    expect(mockText).toHaveBeenCalledWith("RESIDENCIAL PALMEIRAS", 195, 20, { align: "right" });
    
    // Verifica as chamadas das tabelas do autotable (opções de voto e participantes)
    expect(autoTable).toHaveBeenCalledTimes(2);

    // Verifica se salvou o documento com o nome correspondente
    expect(mockSave).toHaveBeenCalledWith("Ata_Pintura_Externa_das_Fachadas.pdf");
  });

  it("deve calcular o quórum de aprovação corretamente (APROVADO 2/3)", () => {
    render(<AtaPDFGenerator {...defaultProps} />);
    
    const button = screen.getByText("Gerar Ata Jurídica (PDF)");
    fireEvent.click(button);

    // Quórum exigido: DOIS_TERCOS. TotalUnits: 100. Votes: 85 (85 >= 66.6)
    // Resultado Legal deve conter "APROVADO (2/3 ALCANÇADO)"
    const textCalls = mockText.mock.calls.map(call => call[0]);
    
    const foundQuorumText = textCalls.some(arr => 
      Array.isArray(arr) && arr.some(str => str.includes("Resultado Legal: APROVADO (2/3 ALCANÇADO)"))
    );

    expect(foundQuorumText).toBe(true);
  });

  it("deve calcular o quórum de reprovação corretamente quando insuficiente", () => {
    const reprovedProps = {
      ...defaultProps,
      voting: {
        ...defaultProps.voting,
        totalVotes: 30, // 30 < 66.6
      }
    };

    render(<AtaPDFGenerator {...reprovedProps} />);
    
    const button = screen.getByText("Gerar Ata Jurídica (PDF)");
    fireEvent.click(button);

    const textCalls = mockText.mock.calls.map(call => call[0]);
    
    const foundReprovedText = textCalls.some(arr => 
      Array.isArray(arr) && arr.some(str => str.includes("Resultado Legal: REPROVADO (QUÓRUM INSUFICIENTE)"))
    );

    expect(foundReprovedText).toBe(true);
  });
});
