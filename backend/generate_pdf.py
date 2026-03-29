from fpdf import FPDF
import os
import glob

class PDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('helvetica', 'B', 15)
            self.cell(0, 10, 'AI Money Mentor: Project Completion Report', 0, 1, 'C')
            self.ln(5)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font('helvetica', 'I', 8)
            self.cell(0, 10, f'Page {self.page_no() - 1}', 0, 0, 'C')

def generate_report():
    outcomes_dir = r"d:\projects\AI Financial Mentor for Students & Beginners\outcomes"
    pdf_file = os.path.join(outcomes_dir, "Project_Completion_Report.pdf")
    
    pdf = PDF()
    
    # Page 1: Blank page as requested
    pdf.add_page()
    
    # Page 2: Report starts
    pdf.add_page()
    pdf.set_font("helvetica", "B", 24)
    pdf.cell(0, 20, "AI Money Mentor", ln=True, align="C")
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "Project Completion Report", ln=True, align="C")
    pdf.ln(10)
    
    pdf.set_font("helvetica", "", 12)
    pdf.multi_cell(0, 10, "Overview:\nThe AI Financial Mentor application has been successfully modernized and personalized to provide a professional, user-centric experience. This report documents the implementation of the AI-powered core, the currency exchanger, and the personalization system.")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "1. User Personalization & Experience", ln=True)
    pdf.set_font("helvetica", "", 11)
    pdf.multi_cell(0, 8, "- Autonomously parses user names for customized greetings.\n- Integrated first-name identification across all dashboards.\n- AI Mentor addresses the user by their name in every interaction.")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "2. AI Mentor Intelligence & Expert Advice", ln=True)
    pdf.set_font("helvetica", "", 11)
    pdf.multi_cell(0, 8, "The system now provides expert advice on RBI guidelines, loans, fixed deposits, and mutual funds tailored to a base salary of 1 Lakh.")
    pdf.ln(5)
    
    # Embedding Images
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "3. AI Mentor Response Visuals", ln=True)
    pdf.ln(5)
    
    images = sorted(glob.glob(os.path.join(outcomes_dir, "*.png")))
    
    for img_path in images:
        filename = os.path.basename(img_path)
        pdf.set_font("helvetica", "I", 10)
        pdf.cell(0, 10, f"Snapshot: {filename}", ln=True)
        # Resize image to fit page width (190mm)
        pdf.image(img_path, w=180)
        pdf.ln(10)
        # Check if we need a new page for next image
        if pdf.get_y() > 200:
            pdf.add_page()

    pdf.add_page()
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "Conclusion", ln=True)
    pdf.set_font("helvetica", "", 12)
    pdf.multi_cell(0, 10, "The platform is now fully production-ready with localized first-name access and expert AI insights. All video and screenshot outcomes are stored in the results directory.")
    
    pdf.output(pdf_file)
    print(f"PDF Successfully generated at {pdf_file}")

if __name__ == "__main__":
    generate_report()
