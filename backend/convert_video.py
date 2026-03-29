import imageio
import sys

def convert_webp_to_mp4(input_path, output_path):
    print(f"Converting {input_path} to {output_path}...")
    try:
        reader = imageio.get_reader(input_path)
        
        # Determine fps, default to 15 if not provided (browser_subagent usually records low fps)
        meta = reader.get_meta_data()
        fps = meta.get('fps', 15)
        
        # Some WebP duration meta is weird, recalculate if necessary
        # Duration is often in ms per frame
        duration = meta.get('duration', 0)
        if duration > 0:
            fps = 1000.0 / duration
            
        print(f"Detected FPS: {fps}")
        
        writer = imageio.get_writer(output_path, format='FFMPEG', mode='I', fps=fps, codec='libx264', macro_block_size=None)
        
        for index, frame in enumerate(reader):
            if index % 50 == 0:
                print(f"Processed {index} frames...")
            # If image has an Alpha channel, remove it (libx264 doesn't support RGBA)
            if frame.shape[2] == 4:
                # Convert RGBA to RGB by blending with white or just stripping alpha
                frame = frame[:, :, :3]
            writer.append_data(frame)
            
        writer.close()
        print(f"Successfully created {output_path}!")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == '__main__':
    video_path = r"d:\projects\AI Financial Mentor for Students & Beginners\outcomes\detailed_demo_video.webp"
    out_path = r"d:\projects\AI Financial Mentor for Students & Beginners\outcomes\detailed_demo_video.mp4"
    import os
    if os.path.exists(video_path):
        convert_webp_to_mp4(video_path, out_path)
