import os
import shutil
import glob
import subprocess
import imageio_ffmpeg

brain_dir = r"C:\Users\katak\.gemini\antigravity\brain\d55057dd-661f-4f6e-8fad-7cbfa5f5eadb"
outcomes_dir = r"d:\projects\AI Financial Mentor for Students & Beginners\outcomes"

# Task 1: Clean outcomes folder
if os.path.exists(outcomes_dir):
    shutil.rmtree(outcomes_dir)
os.makedirs(outcomes_dir)

# Task 2: Copy only 'response' images (Part of 09-19)
print("Copying response images...")
for filepath in glob.glob(os.path.join(brain_dir, "*_ai_mentor_*.png")):
    filename = os.path.basename(filepath)
    print(f"Copying {filename}...")
    shutil.copy(filepath, outcomes_dir)

# Task 3: Convert the 3:45 min demo to mp4
print("Converting video to mp4...")
in_file = os.path.join(brain_dir, "detailed_345_demo_currency_1774764445367.webp")
out_file = os.path.join(outcomes_dir, "detailed_demo_video.mp4")

if os.path.exists(in_file):
    try:
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        # Use -vcodec libx264 for better compatibility and -pix_fmt yuv420p
        subprocess.run([ffmpeg_exe, "-i", in_file, "-vcodec", "libx264", "-pix_fmt", "yuv420p", out_file, "-y"], check=True)
        print(f"Sucessfully created {out_file}!")
    except Exception as e:
        print(f"Error during ffmpeg conversion: {e}")
else:
    print(f"Input file {in_file} does not exist!")

print("Cleanup and conversion finished!")
