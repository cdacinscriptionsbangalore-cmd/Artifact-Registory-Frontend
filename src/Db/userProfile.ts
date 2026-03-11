import profileImage from "@assets/user/profile.png";
import insc1 from "@assets/user/ins/inscription1.png";
import insc2 from "@assets/user/ins/inscription2.png";
import insc3 from "@assets/user/ins/inscription3.png";

const mockUser = {
  _id: "user123",
  name: "Ambika Choudhary",
  profileImage: profileImage,
  imagesUploaded: 42,
  upvotesReceived: 187,
  followers: 56,
  points: 320
};

const mockComments = [
  {
    _id: "comment1",
    postId: "post1",
    subject: "Ancient Egyptian Hieroglyphs",
    userId: "user456",
    username: "John Doe",
    content: "Amazing work on the Rosetta Stone translation! Your insights into the demotic script are invaluable.",
    createdAt: new Date('2024-01-16')
  },
  {
    _id: "comment2",
    postId: "post2",
    userId: "user789",
    subject: "Mesoamerican Archaeology",
    username: "Jane Smith",
    content: "The Maya glyph identification is fascinating! I love how you connected it to the calendar system.",
    createdAt: new Date('2024-01-11')
  },
  {
    _id: "comment3",
    postId: "post3",
    subject: "Roman Numismatics",
    userId: "user456",
    username: "John Doe",
    content: "Great photos of the Roman coin! The details on the Latin inscription are very clear.",
    createdAt: new Date('2024-01-06')
  }
];

const mockPosts = [
  {
    _id: "post1",
    user_id: "user123",
    createdAt: new Date('2024-01-15'),
    images: {
      thumbnailImage: [insc1],
      image: [insc1]
    },
    description: {
      title: "Rosetta Stone Translation",
      subject: "Ancient Egyptian Hieroglyphs",
      description: "Provided translation content for the demotic script section of the Rosetta Stone...",
      scriptLanguage: ["hieroglyphic", "demotic"],
      language: ["ancient-egyptian"],
      upvote: 12,
      geolocation: {
        city: "Cairo",
        region: "Egypt"
      }
    },
    topic: "Translation",
    script: ["Egyptian"],
    type: "stone"
  },
  {
    _id: "post2", 
    user_id: "user123",
    createdAt: new Date('2024-01-10'),
    images: {
      thumbnailImage: [insc2],
      image: [insc2]
    },
    description: {
      title: "Maya Glyph Identification",
      subject: "Mesoamerican Archaeology",
      description: "Identified calendar glyphs from the Temple of Inscriptions at Palenque",
      scriptLanguage: ["mayan"],
      language: ["mayan"],
      upvote: 17,
      geolocation: {
        city: "Palenque",
        region: "Mexico"
      }
    },
    topic: "Identification",
    script: ["Maya"],
    type: "stone"
  },
  {
    _id: "post3",
    user_id: "user123", 
    createdAt: new Date('2024-01-05'),
    images: {
      thumbnailImage: [insc3],
      image: [insc3]
    },
    description: {
      title: "Roman Coin Inscription",
      subject: "Roman Numismatics",
      description: "Uploaded clear images of a Hadrian-era coin with Latin inscription",
      scriptLanguage: ["latin"],
      language: ["latin"],
      upvote: 15,
      geolocation: {
        city: "Rome",
        region: "Italy"
      }
    },
    topic: "Numismatics",
    script: ["Roman"],
    type: "copper plate"
  },
  {
    _id: "post4",
    user_id: "user123", 
    createdAt: new Date('2024-01-01'),
    images: {
      thumbnailImage: [insc1],
      image: [insc1]
    },
    description: {
      title: "Indus Valley Seal",
      subject: "Indus Script Analysis",
      description: "Uploaded images of an Indus Valley seal with undeciphered script",
      scriptLanguage: ["indus"],
      language: ["indus-valley"],
      upvote: 8,
      geolocation: {
        city: "Harappa",
        region: "Pakistan"
      }
    },
    topic: "Archaeology",
  }
];

const dummyPost = [
  {
    _id: "post1",
    user_id: "user123",
    createdAt: new Date('2024-01-15'),
    images: {
      thumbnailImage: ["unsplash.com/300x200/?nature,water"],
      image: [insc1]
    },
    upvote: 12,
    description: {
      title: "Rosetta Stone Translation",
      subject: "Ancient Egyptian Hieroglyphs",
      description: "Provided translation content for the demotic script section of the Rosetta Stone...",
      scriptLanguage: ["hieroglyphic", "demotic"],
      language: ["ancient-egyptian"],
      upvote: 12,
      geolocation: {
        city: "Cairo",
        region: "Egypt"
      }
    },
    topic: "Translation",
    script: ["Egyptian"],
    type: "stone"
  },
  {
    _id: "post2", 
    user_id: "user123",
    createdAt: new Date('2024-01-10'),
    images: {
      thumbnailImage: [insc2],
      image: [insc2]
    },
    description: {
      title: "Maya Glyph Identification",
      subject: "Mesoamerican Archaeology",
      description: "Identified calendar glyphs from the Temple of Inscriptions at Palenque",
      scriptLanguage: ["mayan"],
      language: ["mayan"],
      upvote: 17,
      geolocation: {
        city: "Palenque",
        region: "Mexico"
      }
    },
    topic: "Identification",
    script: ["Maya"],
    type: "stone"
  },
  {
    _id: "post3",
    user_id: "user123", 
    createdAt: new Date('2024-01-05'),
    images: {
      thumbnailImage: [insc3],
      image: [insc3]
    },
    description: {
      title: "Roman Coin Inscription",
      subject: "Roman Numismatics",
      description: "Uploaded clear images of a Hadrian-era coin with Latin inscription",
      scriptLanguage: ["latin"],
      language:["latin"],
      upvote : 15,
      geolocation : {
        city : "Rome",
        region : "Italy"
       }
     },
     topic : "Numismatics",
     script : ["Roman"],
     type : "copper plate"
   }
];

export { mockUser, mockPosts, dummyPost, mockComments };