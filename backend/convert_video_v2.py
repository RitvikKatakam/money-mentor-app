import imageio
import os

in_file = r"C:\Users\katak\.gemini\antigravity\brain\d55057dd-661f-4f6e-8fad-7cbfa5f5eadb\detailed_345_demo_currency_1774764445367.webp"
out_file = r"d:\projects\AI Financial Mentor for Students & Beginners\outcomes\detailed_demo_video.mp4"

print(f"Reading from {in_file}")
try:
    reader = imageio.get_reader(in_file)
    meta_data = reader.get_meta_data()
    fps = meta_data.get('fps', 15)
    print(f"Metadata: {meta_data}")
    
    writer = imageio.get_writer(out_file, format='FFMPEG', mode='I', fps=fps, codec='libx264', pixelformat='yuv420p', macro_block_size=None)
    
    for i, frame in enumerate(reader):
        if i % 100 == 0:
            print(f"Processed {i} frames...")
        # Strip alpha if present
        if frame.shape[2] == 4:
            frame = frame[:, :, :3]
        writer.append_data(frame)
        
    writer.close()
    print("Video conversion finished successfully!")
except Exception as e:
    print(f"Error during video conversion: {e}")
