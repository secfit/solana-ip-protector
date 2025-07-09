import * as pdfjsLib from 'pdfjs-dist';
import { PaperSection } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedSection {
  type: 'abstract' | 'introduction' | 'related_works' | 'proposed_model' | 'conclusion';
  content: string;
  startPage: number;
  endPage: number;
}

export class PDFProcessor {
  private sectionKeywords = {
    abstract: ['abstract', 'summary'],
    introduction: ['introduction', '1. introduction', 'i. introduction'],
    related_works: ['related work', 'related works', 'literature review', 'background'],
    proposed_model: ['proposed', 'methodology', 'method', 'approach', 'model', 'solution'],
    conclusion: ['conclusion', 'conclusions', 'summary', 'final remarks']
  };

  async extractSections(file: File): Promise<ExtractedSection[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const pageTexts: string[] = [];
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        pageTexts.push(pageText);
        fullText += pageText + '\n';
      }

      // Find sections using pattern matching
      const sections = this.identifySections(fullText, pageTexts);
      
      return sections;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  private identifySections(fullText: string, pageTexts: string[]): ExtractedSection[] {
    const sections: ExtractedSection[] = [];
    const normalizedText = fullText.toLowerCase();
    
    // Find each section based on keywords and structure
    for (const [sectionType, keywords] of Object.entries(this.sectionKeywords)) {
      const sectionContent = this.extractSectionContent(
        normalizedText, 
        fullText, 
        keywords, 
        sectionType as keyof typeof this.sectionKeywords
      );
      
      if (sectionContent) {
        sections.push({
          type: sectionType as ExtractedSection['type'],
          content: sectionContent,
          startPage: 1, // Simplified - would need more complex logic for exact pages
          endPage: 1
        });
      }
    }

    return sections;
  }

  private extractSectionContent(
    normalizedText: string, 
    originalText: string, 
    keywords: string[], 
    sectionType: string
  ): string | null {
    // Find the section header
    let sectionStart = -1;
    let matchedKeyword = '';
    
    for (const keyword of keywords) {
      const index = normalizedText.indexOf(keyword);
      if (index !== -1) {
        sectionStart = index;
        matchedKeyword = keyword;
        break;
      }
    }

    if (sectionStart === -1) {
      return null;
    }

    // Find the end of the section (next section or end of document)
    const nextSectionKeywords = Object.values(this.sectionKeywords)
      .flat()
      .filter(k => k !== matchedKeyword);
    
    let sectionEnd = originalText.length;
    for (const nextKeyword of nextSectionKeywords) {
      const nextIndex = normalizedText.indexOf(nextKeyword, sectionStart + matchedKeyword.length);
      if (nextIndex !== -1 && nextIndex < sectionEnd) {
        sectionEnd = nextIndex;
      }
    }

    // Extract and clean the content
    const content = originalText.substring(sectionStart, sectionEnd)
      .replace(/\s+/g, ' ')
      .trim();

    // Return meaningful content (at least 50 characters)
    return content.length > 50 ? content : null;
  }

  // Fallback method for demo purposes
  generateMockSections(fileName: string): ExtractedSection[] {
    return [
      {
        type: 'abstract',
        content: `This paper presents a novel approach to blockchain-based intellectual property protection using advanced machine learning techniques. Our system provides automated analysis and protection of research papers by storing unique fingerprints on the Solana blockchain. The proposed method achieves 95% accuracy in detecting potential IP violations while maintaining low computational overhead.`,
        startPage: 1,
        endPage: 1
      },
      {
        type: 'introduction',
        content: `Intellectual property theft in academic research has become increasingly problematic with the rise of digital publishing. Traditional methods of protecting research are inadequate for modern challenges. This work addresses these limitations through blockchain technology, specifically leveraging Solana's high-performance architecture to create immutable records of research contributions.`,
        startPage: 1,
        endPage: 2
      },
      {
        type: 'related_works',
        content: `Previous work in IP protection has focused on watermarking and digital signatures. However, these approaches lack the transparency and immutability required for effective protection. Recent blockchain applications have shown promise in various domains including supply chain management and digital asset protection. Our work builds upon these foundations while addressing specific challenges in academic publishing.`,
        startPage: 2,
        endPage: 3
      },
      {
        type: 'proposed_model',
        content: `Our proposed model combines natural language processing with blockchain technology to create an immutable record of research contributions. The system analyzes each section for novelty using GPT-4 and stores unique identifiers on Solana using Program Derived Addresses. The architecture includes three main components: content analysis, uniqueness scoring, and blockchain storage with cryptographic verification.`,
        startPage: 3,
        endPage: 4
      },
      {
        type: 'conclusion',
        content: `The experimental results demonstrate the effectiveness of our approach in protecting intellectual property while maintaining transparency and verification capabilities. Our system achieved 95% accuracy in novelty detection and processed documents 3x faster than existing solutions. Future work will focus on scaling the system for larger academic institutions and integrating with existing publication workflows.`,
        startPage: 4,
        endPage: 4
      }
    ];
  }
}