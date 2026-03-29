from fpdf import FPDF
import os
import glob
import re

class ProjectReport(FPDF):
    def header(self):
        pass

    def footer(self):
        # Watermark on every page
        self.set_y(-15)
        self.set_text_color(200, 200, 200) # Light Gray
        self.set_font("helvetica", "I", 8)
        self.cell(0, 10, "Et_gen AI hackathon", align="L")
        
        # Page numbers starting from Page 2
        if self.page_no() > 1:
            self.set_text_color(0, 0, 0)
            self.set_font("helvetica", "I", 8)
            self.cell(0, 10, f"Page {self.page_no() - 1}", align="R")
        self.set_text_color(0, 0, 0) # Reset

def generate_report():
    outcomes_dir = r"d:\projects\AI Financial Mentor for Students & Beginners\outcomes"
    pdf_file = os.path.join(outcomes_dir, "report.pdf")
    
    pdf = ProjectReport()
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # Page 1: Cover Page
    pdf.add_page()
    pdf.set_font("helvetica", "B", 40)
    pdf.ln(80)
    pdf.cell(0, 40, "AI Money Mentor", ln=True, align="C")
    pdf.set_font("helvetica", "I", 14)
    pdf.cell(0, 10, "Smarter Finance. Smarter Decisions.", ln=True, align="C")
    pdf.ln(20)
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 10, "Structured Project Outcome & Deliverables Report", ln=True, align="C")

    module_names = {
        "01": "Dashboard & Currency Exchange Terminal",
        "02": "Money Insights & Cash Flow Mapping",
        "03": "Budget Tracker & Limit Enforcement",
        "04": "Goal Planner & Trajectory Prediction",
        "05": "Investment Advisor & Asset Allocation",
        "06": "Loan Analyzer & EMI Simulation",
        "07": "Simulator & Financial Health Scoring",
        "08": "Smart Alerts & Neural Warning System"
    }

    mentor_descriptions = {
        "09": "AI Mentor provides instant guidance. This initial response demonstrates the interface's ability to recognize the user and prepare personalized advice.",
        "10": "The Mentor's stream specifically addresses the differences between loans and deposits based on the user's target profile.",
        "11": "Deeper analysis: The AI Mentor breaks down the RBI's role in governing interest rates and how those changes impact earnings. This step marks the intersection of regulatory policy and personal budgeting.",
        "12": "The mentor then provides a comparative analysis of Mutual Funds, highlighting risk levels and expected returns in the current market.",
        "13": "This section concludes the explanation on SIPs, guiding the user on how to automate their investments for compounded growth.",
        "14": "Further interaction: The mentor elaborates on tax-saving instruments, ensuring the user optimizes their take-home pay.",
        "15": "A broader view of the chat interface shows the seamless flow of conversation, maintaining context as the user shifts between queries.",
        "16": "Here, the mentor provides a final summary of steps for the month, giving the user an actionable checklist for their specified salary.",
        "17": "This view confirms the interface's ability to format complex financial data into readable bullet points.",
        "18": "The final part of the core response, where the mentor asks for any further clarifications to explore in depth.",
        "19": "The full-page report overview shows the completed conversation. This represents the total AI evaluation of the user's request."
    }

    all_pngs = sorted(glob.glob(os.path.join(outcomes_dir, "*.png")))
    images = [f for f in all_pngs if re.match(r"^\d{2}_", os.path.basename(f))]
    
    section_num = 0
    in_mentor_section_active = False
    
    for i, img_path in enumerate(images):
        filename = os.path.basename(img_path)
        index_key = filename.split("_")[0]
        idx = int(index_key)
        
        if idx < 9:
            pdf.add_page()
            section_num += 1
            section_name = module_names.get(index_key, "Module Insight")
            pdf.set_font("helvetica", "B", 18)
            pdf.cell(0, 10, f"{section_num}: {section_name}", ln=True, align="L")
            pdf.ln(5)
            
            pdf.image(img_path, w=180)
            pdf.ln(10)
            
            pdf.set_font("helvetica", "", 12)
            # Simplified map for loop
            desc_map = {
                "01": "The Quick Sync Terminal allows users to perform real-time currency conversions, directly from the main dashboard.",
                "02": "Money Insights provides a granular look at the user's cash flow, determine a healthy savings ratio.",
                "03": "The Budget Tracker module enforces financial discipline by categorized spending limits.",
                "04": "The Goal Planner utilizes predictive trajectories to help users achieve long-term milestones.",
                "05": "Investment Advisor offers risk-adjusted portfolio recommendations, navigate market shifts.",
                "06": "Loan Analyzer simulates repayment scenarios, allowing users to evaluate EMIs and costs.",
                "07": "The Simulator module calculates the financial health score, based on current habits.",
                "08": "Smart Alerts act as a neural warning system, notifying users of budget variances."
            }
            desc = desc_map.get(index_key, "Visual overview of the AI Money Mentor functional component.")
            pdf.multi_cell(0, 10, desc)
            
        else:
            # AI Mentor Section (9+)
            if not in_mentor_section_active:
                pdf.add_page()
                section_num += 1
                in_mentor_section_active = True
                pdf.set_font("helvetica", "B", 18)
                pdf.cell(0, 10, f"{section_num}: AI Mentor Comprehensive Session", ln=True, align="L")
                pdf.ln(5)
            else:
                remaining_height = 297 - pdf.get_y() - 30 
                if remaining_height < 100:
                    pdf.add_page()
                    pdf.ln(10) 
                else:
                    pdf.ln(10) 

            # The image
            pdf.image(img_path, w=180)
            pdf.ln(5)
            
            # The description
            pdf.set_font("helvetica", "", 12)
            desc = mentor_descriptions.get(index_key, "AI Mentor functional interface perspective.")
            
            if index_key == "11":
                pdf.set_font("helvetica", "B", 13)
                pdf.cell(0, 10, "DETAILED_EXPERT_ANALYSIS", ln=True)
                pdf.set_font("helvetica", "", 12)
                pdf.multi_cell(0, 8, desc)
                pdf.ln(5)
                pdf.multi_cell(0, 8, "The importance of this module lies in its ability to translate complex RBI policies into daily financial habits. By understanding yield behavior, users can make more rational decisions that outpace inflation.")
                pdf.ln(5)
                pdf.multi_cell(0, 8, "Impact: This transparency reduces the 'uncertainty gap' for new investors, leading to higher confidence in deploying savings into long-term wealth instruments.")
            else:
                pdf.multi_cell(0, 10, desc)

    pdf.output(pdf_file)
    print(f"Final PDF with Global Watermark Generated at: {pdf_file}")

if __name__ == "__main__":
    generate_report()
