import profileImage from "@assets/user/profile.png";
import insc1 from "@assets/user/ins/inscription1.png";
import insc2 from "@assets/user/ins/inscription2.png";
import insc3 from "@assets/user/ins/inscription3.png";
import { dummyComments } from "../views/InscriptionDetailPage.tsx/dummyData";
import { mockDiscoveryPosts } from "../Db/feeds";

const mockUser = {
  _id: "user123",
  name: "Ambika Choudhary",
  profileImage: profileImage,
  imagesUploaded: 42,
  upvotesReceived: 187,
  followers: 56,
  points: 320
};

const FEED_POST_IDS = [
  "6915792a1320a08c6c576ca8",
  "69118753d23e86bbb9cb8ce7", // Rock inscription 1
  "69118ba3d23e86bbb9cb8ce9", // Vijayanagara inscription
  "6913054f05959ad242fe9751",
  "69130efa05959ad242fe9758", // Chola inscription
  "6913215f05959ad242fe9762", // Hampi inscription,
  "691481c31320a08c6c576ca4",
];

const mockComments = dummyComments
  .filter(comment => comment.userId === "user123")
  .map(comment => {

    const relatedPost =
      mockDiscoveryPosts.data.find(
        post => post._id === comment.postId
      );

    return {
      ...comment,

      postImageUrl:
        relatedPost?.images?.thumbnailImage ??
        relatedPost?.images?.image?.[0] ??
        "",
    };
  });

const mockPosts = [
  {
    _id: FEED_POST_IDS[0],
    user_id: "user123",
    createdAt: new Date("2025-11-10"),
    "images": {
      "thumbnailImage": "https://pbs.twimg.com/media/EKr-mQnUcAAY_Uh.jpg",
      "image": [
        "https://pbs.twimg.com/media/EKr-mQnUcAAY_Uh.jpg"]
    },
    description: {
      title: "Rock inscription 1",
      subject: "Stone inscription",
      description: "Profile mock post linked to feed mock data.",
      scriptLanguage: ["Kannada"],
      language: ["Kannada"],
      upvote: 12,
      geolocation: {
        city: "Bengaluru",
        region: "Karnataka",
      },
    },
    topic: "Epigraphy",
    script: ["Kannada"],
    type: "Stone",
  },

  {
    _id: FEED_POST_IDS[1],
    user_id: "user123",
    createdAt: new Date("2025-11-11"),
    "images": {
      "thumbnailImage": "https://upload.wikimedia.org/wikipedia/en/e/ed/Umachal_Rock_Inscription.png",
      "image": [
        "https://upload.wikimedia.org/wikipedia/en/e/ed/Umachal_Rock_Inscription.png"
      ]
    },
    description: {
      title: "Vijayanagara inscription",
      subject: "Temple inscription",
      description: "Profile mock post linked to feed mock data.",
      scriptLanguage: ["Kannada"],
      language: ["Kannada"],
      upvote: 17,
      geolocation: {
        city: "Bengaluru",
        region: "Karnataka",
      },
    },
    topic: "History",
    script: ["Kannada"],
    type: "Stone",
  },

  {
    _id: FEED_POST_IDS[2],
    user_id: "user123",
    createdAt: new Date("2025-11-12"),
    "images": {
      "thumbnailImage": "https://www.worldhistory.org/uploads/images/19292.png?v=1722463500-1722941054",
      "image": [
        "https://www.worldhistory.org/uploads/images/19292.png?v=1722463500-1722941054"
      ]
    },
    description: {
      title: "Chola inscription",
      subject: "Tamil inscription",
      description: "Profile mock post linked to feed mock data.",
      scriptLanguage: ["Tamil"],
      language: ["Tamil"],
      upvote: 15,
      geolocation: {
        city: "Bengaluru",
        region: "Karnataka",
      },
    },
    topic: "Archaeology",
    script: ["Tamil"],
    type: "Stone",
  },
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
  }
];

export { mockUser, mockPosts, dummyPost, mockComments };