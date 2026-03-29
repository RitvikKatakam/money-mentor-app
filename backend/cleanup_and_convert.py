import os
import glob
import subprocess
import imageio_ffmpeg

outcomes_dir = r"d:\projects\AI Financial Mentor for Students & Beginners\outcomes"

# Task 1: Delete all pictures except 'response' images
print("Cleaning up images...")
for filepath in glob.glob(os.path.join(outcomes_dir, "*.png")):
    filename = os.path.basename(filepath).lower()
    if "response" not in filename:
        print(f"Deleting {filename}...")
        os.remove(filepath)
    else:
        print(f"Keeping {filename}...")

# Task 2: Convert detailed_demo_video.webp to mp4 using bundled ffmpeg
print("Converting video...")
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
in_file = os.path.join(outcomes_dir, "detailed_demo_video.webp")
out_file = os.path.join(outcomes_dir, "detailed_demo_video.mp4")

if os.path.exists(in_file):
    try:
        subprocess.run([ffmpeg_exe, "-i", in_file, out_file, "-y"], check=True)
        print("Conversion successful!")
    except Exception as e:
        print(f"Error during ffmpeg conversion: {e}")
else:
    print(f"Input file {in_file} does not exist!")
