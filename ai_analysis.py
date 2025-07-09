import os
import sys
import json
from typing import Dict, List, Any
from dataclasses import dataclass
from dotenv import load_dotenv
import openai

# Load environment variables from .env
load_dotenv()

@dataclass
class AnalysisResult:
    summary: str
    uniqueness_score: int
    section_type: str

class IPAnalyzer:

    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
        self.system_prompt = (
            "You are a research analysis assistant. Your task is to review the section of a scientific paper and provide two outputs:\n\n"
            "1. A concise summary of the main idea and contribution expressed in the section.\n"
            "2. A uniqueness score (from 0 to 100) that estimates how original or novel the idea seems, based on general academic patterns.\n\n"
            "Be neutral, avoid assumptions not supported by the text, and respond in JSON with keys: \"summary\" and \"uniqueness_score\"."
        )

    def analyze_section(self, section_content: str, section_type: str) -> AnalysisResult:
        user_prompt = (
            f"Here is the {section_type.replace('_', ' ').upper()} of a scientific paper.\n"
            f"Please provide:\n1. A short summary (2–4 sentences).\n"
            f"2. A uniqueness score (0–100).\n\nSection content:\n{section_content}"
        )

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=400,
                temperature=0.3
            )

            content = response.choices[0].message.content.strip()

            # Debug output to stderr only
            print(f"[Debug] Raw response:\n{content}", file=sys.stderr)

            # Strip Markdown code fences if present
            if content.startswith("```json") and content.endswith("```"):
                content = content[7:-3].strip()
            elif content.startswith("```") and content.endswith("```"):
                content = content[3:-3].strip()

            try:
                result_json = json.loads(content)
            except json.JSONDecodeError as e:
                print("[Error] Failed to parse JSON:", e, file=sys.stderr)
                print("[Debug] Cleaned response:", content, file=sys.stderr)
                raise

            return AnalysisResult(
                summary=result_json["summary"],
                uniqueness_score=int(result_json["uniqueness_score"]),
                section_type=section_type
            )

        except Exception as e:
            print(f"[Error] Failed to analyze {section_type}: {str(e)}", file=sys.stderr)
            return AnalysisResult(
                summary=f"Error analyzing {section_type}",
                uniqueness_score=0,
                section_type=section_type
            )

    def analyze_paper(self, sections: List[Dict[str, Any]]) -> List[AnalysisResult]:
        """Analyze all sections of a paper"""
        results = []
        for section in sections:
            if isinstance(section, dict) and "content" in section and "type" in section:
                results.append(self.analyze_section(section["content"], section["type"]))
            else:
                print(f"[Warning] Skipping invalid section format: {section}", file=sys.stderr)
        return results

def main():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("[Fatal] OPENAI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    analyzer = IPAnalyzer(api_key)

    # Load sections input
    try:
        if len(sys.argv) > 1:
            input_path = sys.argv[1]
            with open(input_path, 'r', encoding='utf-8') as f:
                raw = f.read()
        else:
            raw = sys.stdin.read()

        try:
            sections = json.loads(raw)
        except json.JSONDecodeError:
            print("[Warning] Input is not valid JSON. Wrapping as single section.", file=sys.stderr)
            sections = [{"type": "generic", "content": raw.strip()}]

    except Exception as e:
        print(f"[Fatal] Failed to read input: {str(e)}", file=sys.stderr)
        sys.exit(1)

    # Run analysis
    results = analyzer.analyze_paper(sections)

    # Prepare output
    output = {
        "results": [
            {
                "section_type": r.section_type,
                "summary": r.summary,
                "uniqueness_score": r.uniqueness_score
            }
            for r in results
        ],
        "total_sections": len(results),
        "average_score": round(
            sum(r.uniqueness_score for r in results) / len(results), 2
        ) if results else 0.0
    }

    print(json.dumps(output, indent=2))  # clean JSON output to stdout only

if __name__ == "__main__":
    main()
