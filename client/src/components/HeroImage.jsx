import { useState } from 'react';

const HeroImage = () => {
  const [imageError, setImageError] = useState(false);
  
  // You can easily swap these URLs with your generated images
  const imageOptions = [
    {
      src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      alt: "African female doctor examining elderly patient with stethoscope"
    },
    {
      src: "/images/hero/generated-image-1.jpg", // Replace with your generated image
      alt: "Generated image of African healthcare professional"
    },
    {
      src: "/images/hero/generated-image-2.jpg", // Replace with your generated image
      alt: "Generated image of compassionate medical care"
    }
  ];

  // Use the first available image (you can make this dynamic)
  const currentImage = imageOptions[0];

  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = 'none';
    e.target.parentElement.style.background = 'linear-gradient(135deg, #4338ca 20%, #6366f1 80%)';
  };

  return (
    <div className="hero-image">
      <div className="hero-medical-photo">
        {!imageError && (
          <img 
            src={currentImage.src}
            alt={currentImage.alt}
            className="hero-medical-image"
            loading="lazy"
            onError={handleImageError}
          />
        )}
        
        <div className="hero-image-caption">
          <h3>Compassionate African Healthcare</h3>
          <p>Expert medical professionals dedicated to your wellbeing</p>
        </div>
      </div>
    </div>
  );
};

export default HeroImage;