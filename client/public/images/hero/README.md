# Hero Section Images

## How to Add Generated Images

1. **Generate your image** using your preferred AI image generator (DALL-E, Midjourney, Stable Diffusion, etc.)

2. **Recommended prompt for African healthcare scene:**
   ```
   "Professional African female doctor in white coat with stethoscope examining elderly African patient in traditional dress, warm hospital setting, compassionate healthcare, high quality, professional photography style"
   ```

3. **Image specifications:**
   - **Aspect ratio:** 4:3 (recommended)
   - **Resolution:** 1200x900px or higher
   - **Format:** JPG or PNG
   - **File size:** Under 500KB for optimal loading

4. **Add your image:**
   - Save your generated image in this folder (`client/public/images/hero/`)
   - Name it something descriptive like `african-doctor-patient.jpg`

5. **Update the code:**
   - Open `client/src/App.jsx`
   - Find the `<img>` tag in the hero section (around line 215)
   - Replace the `src` attribute:
   ```jsx
   src="/images/hero/your-image-name.jpg"
   ```

6. **Alternative: Use external URLs**
   - You can also use direct URLs from image hosting services
   - Just replace the `src` with your image URL

## Current Image
The current image is a placeholder from Unsplash showing African healthcare professionals. Replace it with your generated image for a more customized look.

## Multiple Images (Optional)
You can create an image carousel by:
1. Adding multiple images to this folder
2. Modifying the component to cycle through images
3. Adding navigation controls

## Image Optimization Tips
- Use WebP format for better compression
- Consider lazy loading for performance
- Add proper alt text for accessibility