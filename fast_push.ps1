# Remove large files that might block the push
Remove-Item -Path "videos/4.mp4" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "AIMoneyMentor_video.mp4" -Force -ErrorAction SilentlyContinue

# Clean git and re-init
Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
git init
git remote add origin https://github.com/RitvikKatakam/ai-money-mentor.git
git branch -m main
git add .
git commit -m "Final project submission"
git push origin main --force
