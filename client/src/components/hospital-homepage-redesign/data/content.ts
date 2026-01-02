// Content data for Hospital Homepage Redesign
import { 
  HospitalContent, 
  ImageAssets, 
  BrandingConfig, 
  HeroContent, 
  AboutContent, 
  ServicesContent, 
  WhyChooseUsContent, 
  BookingContent, 
  TestimonialsContent, 
  NewsletterContent, 
  ContactContent 
} from '../types';

// Branding Configuration
export const brandingConfig: BrandingConfig = {
  hospitalName: 'Thappy Home Hospital',
  logo: {
    src: '/images/hospital-logo.png',
    alt: 'Thappy Home Hospital Logo',
    width: 120,
    height: 60,
    loading: 'eager'
  },
  colors: {
    primary: '#4338ca', // Professional blue
    secondary: '#6366f1', // Lighter blue
    accent: '#3b82f6', // Accent blue
    emergency: '#dc2626', // Emergency red
    background: '#ffffff', // Clean white
    text: '#1f2937' // Dark gray text
  },
  fonts: {
    primary: 'Inter, system-ui, -apple-system, sans-serif',
    secondary: 'Roboto, system-ui, -apple-system, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    }
  }
};

// Hero Section Content
export const heroContent: HeroContent = {
  headline: 'Expert Care in Neurosurgery',
  subheadline: 'Compassionate Healthcare Excellence',
  description: 'At Thappy Home Hospital, we provide world-class neurosurgical care with a personal touch. Our experienced team of specialists is dedicated to delivering exceptional patient outcomes through advanced medical technology and compassionate care.',
  ctaText: 'Book an Appointment',
  heroImage: {
    src: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Healthcare professional consulting with patient',
    width: 600,
    height: 400,
    loading: 'eager'
  },
  backgroundGradient: {
    direction: 'to right',
    colors: ['#4338ca', '#6366f1']
  }
};

// About Section Content
export const aboutContent: AboutContent = {
  heading: 'Specialized Experts Dedicated to Saving Lives',
  subheading: 'Excellence in Medical Care',
  description: 'Our hospital combines cutting-edge medical technology with a patient-centric approach to deliver exceptional healthcare services. We specialize in complex medical procedures while maintaining the highest standards of patient care and safety.',
  specializations: [
    'Neurosurgery',
    'Brain & Spine',
    'Dialysis',
    'ICU Services'
  ],
  facilityImage: {
    src: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Modern hospital reception area',
    width: 500,
    height: 350,
    loading: 'lazy'
  },
  ctaText: 'Learn More'
};

// Services Section Content
export const servicesContent: ServicesContent = {
  heading: 'Prompt, Profound & Professional Medical Care Tailored to Your Needs',
  subheading: 'Comprehensive Medical Services',
  services: [
    {
      id: 'neurosurgery',
      title: 'Neurosurgery',
      description: 'Advanced neurosurgical procedures performed by our expert team using state-of-the-art equipment and techniques. We specialize in brain and nervous system surgeries with exceptional patient outcomes.',
      image: {
        src: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        alt: 'Modern neurosurgery operating room',
        width: 400,
        height: 300,
        loading: 'lazy'
      },
      features: [
        'Advanced surgical techniques',
        'State-of-the-art equipment',
        'Expert neurosurgical team',
        'Comprehensive post-operative care'
      ]
    },
    {
      id: 'brain-spine',
      title: 'Brain & Spine Treatment',
      description: 'Comprehensive treatment for brain and spine conditions using the latest medical technology and evidence-based approaches. Our specialists provide personalized care for complex neurological conditions.',
      image: {
        src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        alt: 'Advanced brain and spine treatment equipment',
        width: 400,
        height: 300,
        loading: 'lazy'
      },
      features: [
        'Advanced imaging technology',
        'Minimally invasive procedures',
        'Specialized treatment protocols',
        'Multidisciplinary care team'
      ]
    },
    {
      id: 'dialysis',
      title: 'Dialysis',
      description: 'Professional dialysis services in a comfortable, modern facility with experienced medical staff. We provide both hemodialysis and peritoneal dialysis options tailored to each patient\'s needs.',
      image: {
        src: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        alt: 'Modern dialysis treatment facility',
        width: 400,
        height: 300,
        loading: 'lazy'
      },
      features: [
        'Modern dialysis equipment',
        'Experienced nursing staff',
        'Comfortable treatment environment',
        'Flexible scheduling options'
      ]
    }
  ]
};

// Why Choose Us Section Content
export const whyChooseUsContent: WhyChooseUsContent = {
  heading: 'Dedicated to Saving Lives',
  subheading: 'Our Approach is Patient-Centric',
  description: 'We believe that exceptional healthcare goes beyond medical expertise. Our commitment to patient-centered care ensures that every individual receives personalized attention and the highest quality treatment.',
  features: [
    {
      id: '24-7-care',
      title: '24/7 Specialized Medical Care',
      icon: 'clock',
      description: 'Round-the-clock medical care with specialized staff available at all times'
    },
    {
      id: 'world-class-facilities',
      title: 'World-Class Facilities & Technology',
      icon: 'hospital',
      description: 'State-of-the-art medical equipment and modern facilities for optimal patient care'
    },
    {
      id: 'personalized-experience',
      title: 'Personalized Patient Experience',
      icon: 'heart',
      description: 'Individualized care plans tailored to each patient\'s unique needs and circumstances'
    },
    {
      id: 'experienced-experts',
      title: 'Experienced, Compassionate Experts',
      icon: 'user-md',
      description: 'Highly qualified medical professionals with years of experience and genuine care for patients'
    }
  ],
  facilityImage: {
    src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Thappy Home Hospital building exterior',
    width: 500,
    height: 350,
    loading: 'lazy'
  },
  ctaText: 'Get In Touch With Us'
};

// Booking Section Content
export const bookingContent: BookingContent = {
  heading: 'Book an Appointment with Us!',
  description: 'Experience quick treatments with no long waiting times. Our streamlined appointment system ensures you receive the care you need when you need it.',
  benefits: [
    'Simply reserve a time slot, walk in at the appointed time and get prioritized treatments at no extra cost',
    'Quick and efficient appointment scheduling',
    'Minimal waiting times',
    'Priority treatment for scheduled appointments'
  ],
  ctaText: 'Reserve My Slot',
  backgroundImage: {
    src: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Medical consultation room',
    width: 600,
    height: 400,
    loading: 'lazy'
  }
};

// Testimonials Section Content
export const testimonialsContent: TestimonialsContent = {
  heading: 'What Our Clients Say',
  testimonials: [
    {
      id: 'testimonial-1',
      name: 'Sarah Johnson',
      content: 'The neurosurgery team at Thappy Home Hospital saved my life. Their expertise and compassionate care made all the difference during my recovery. I cannot thank them enough for their dedication.',
      avatar: {
        src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
        alt: 'Sarah Johnson',
        width: 80,
        height: 80,
        loading: 'lazy'
      },
      rating: 5
    },
    {
      id: 'testimonial-2',
      name: 'Michael Chen',
      content: 'The staff quality at this hospital is exceptional. From the nurses to the doctors, everyone showed genuine care and professionalism. The facilities are modern and clean, making my treatment experience comfortable.',
      avatar: {
        src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
        alt: 'Michael Chen',
        width: 80,
        height: 80,
        loading: 'lazy'
      },
      rating: 5
    },
    {
      id: 'testimonial-3',
      name: 'Emily Rodriguez',
      content: 'I was impressed by the world-class facilities and the personalized attention I received. The medical team took time to explain everything and made sure I was comfortable throughout my treatment.',
      avatar: {
        src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
        alt: 'Emily Rodriguez',
        width: 80,
        height: 80,
        loading: 'lazy'
      },
      rating: 5
    }
  ]
};

// Newsletter Section Content
export const newsletterContent: NewsletterContent = {
  heading: 'SIGN UP FOR OUR HEALTH TIPS',
  description: 'Get notified everytime we publish a health blog post',
  ctaText: 'Subscribe Now',
  privacyText: 'By subscribing, you agree to our Privacy Policy and Terms of Service. We respect your privacy and will never share your information with third parties.'
};

// Contact Section Content
export const contactContent: ContactContent = {
  phoneNumbers: [
    '+234 810 314 6408',
    '+234 901 234 5678'
  ],
  addresses: [
    {
      type: 'head',
      address: '33, Ishaga Road',
      city: 'Surulere',
      state: 'Lagos'
    },
    {
      type: 'branch',
      address: '6, Ogunlana Drive',
      city: 'Surulere',
      state: 'Lagos'
    }
  ],
  ctaText: 'CONTACT US',
  whatsappNumber: '+234 810 314 6408'
};

// Image Assets Configuration
export const imageAssets: ImageAssets = {
  hero: {
    patientCare: {
      src: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Healthcare professional providing patient care',
      width: 600,
      height: 400,
      loading: 'eager'
    },
    nursePatient: {
      src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Nurse consulting with patient',
      width: 600,
      height: 400,
      loading: 'eager'
    }
  },
  facilities: {
    hospitalExterior: {
      src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Thappy Home Hospital exterior building',
      width: 500,
      height: 350,
      loading: 'lazy'
    },
    reception: {
      src: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Modern hospital reception area',
      width: 500,
      height: 350,
      loading: 'lazy'
    },
    operatingRoom: {
      src: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'State-of-the-art operating room',
      width: 400,
      height: 300,
      loading: 'lazy'
    },
    dialysisRoom: {
      src: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Modern dialysis treatment room',
      width: 400,
      height: 300,
      loading: 'lazy'
    },
    consultationRoom: {
      src: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Medical consultation room',
      width: 600,
      height: 400,
      loading: 'lazy'
    }
  },
  services: {
    neurosurgery: {
      src: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Neurosurgery operating room',
      width: 400,
      height: 300,
      loading: 'lazy'
    },
    brainSpine: {
      src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Brain and spine treatment equipment',
      width: 400,
      height: 300,
      loading: 'lazy'
    },
    dialysis: {
      src: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      alt: 'Dialysis treatment facility',
      width: 400,
      height: 300,
      loading: 'lazy'
    }
  },
  testimonials: {
    patient1: {
      src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
      alt: 'Patient testimonial photo',
      width: 80,
      height: 80,
      loading: 'lazy'
    },
    patient2: {
      src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
      alt: 'Patient testimonial photo',
      width: 80,
      height: 80,
      loading: 'lazy'
    },
    patient3: {
      src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
      alt: 'Patient testimonial photo',
      width: 80,
      height: 80,
      loading: 'lazy'
    }
  },
  branding: {
    logo: {
      src: '/images/hospital-logo.png',
      alt: 'Thappy Home Hospital Logo',
      width: 120,
      height: 60,
      loading: 'eager'
    },
    logoWhite: {
      src: '/images/hospital-logo.png',
      alt: 'Thappy Home Hospital Logo White',
      width: 120,
      height: 60,
      loading: 'eager'
    }
  }
};

// Main Hospital Content Configuration
export const hospitalContent: HospitalContent = {
  branding: brandingConfig,
  hero: heroContent,
  about: aboutContent,
  services: servicesContent,
  whyChooseUs: whyChooseUsContent,
  booking: bookingContent,
  testimonials: testimonialsContent,
  newsletter: newsletterContent,
  contact: contactContent
};