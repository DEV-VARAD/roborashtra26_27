import { getCloudinaryUrl } from '@/lib/cloudinary'

function facultyPortrait(publicId, fallbackPath) {
  const url = getCloudinaryUrl(publicId, {
    width: 600,
    height: 750,
    crop: 'fill',
    gravity: 'auto',
    format: 'auto',
    quality: 'auto',
    dpr: true,
  })
  return url || fallbackPath
}

export const facultyMembers = [
  {
    id: 'faculty-01',
    name: 'Prof. Pallavi Kulkarni',
    designation: 'Faculty Coordinator',
    department: 'Department of Computer Science Engineering',
    description:
      'Spearheading autonomous kinematics architectures, ROS 2 deployment, and national combat robotics mentorship for over 12 years.',
    image: facultyPortrait('roborashtra/team/faculty/pallavikulkarni', '/team/pallavikulkarni.png'),
    badge: 'FACULTY DIRECTOR',
    credentials: 'Ph.D. Robotics (IITB) · IEEE Senior Member',
    socials: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
    },
  },
  {
    id: 'faculty-02',
    name: 'Prof. Vrushali Deore',
    designation: 'Faculty Coordinator',
    department: 'Department of Computer Science Engineering',

    description:
      'Leading embedded vision pipelines, high-speed FPV dynamics, and precision manipulator telemetry across all competitive fleets.',
    image: facultyPortrait('roborashtra/team/faculty/vrushalideore', '/team/vrushalideore.png'),
    badge: 'CHIEF COORDINATOR',
    credentials: 'M.Tech AI & Automation · 8+ Years Industry Mentorship',
    socials: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      twitter: 'https://x.com',
    },
  },
]

